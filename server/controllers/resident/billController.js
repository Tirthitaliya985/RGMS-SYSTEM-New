import Payment from "../../models/Payment.js";
import Bill from "../../models/Bill.js";
import razorpay from "../../utils/razorpay.js";
import crypto from "crypto";

export const getMyBills = async (req, res) => {
  try {
    const bills = await Bill.find({ residentId: req.user.id })
      .populate("societyId", "name")
      .sort({ createdAt: -1 });

    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createRazorpayOrder = async (req, res) => {
  const { amount, billId } = req.body;
  if (!amount || !billId) {
    return res.status(400).json({ success: false, message: "Missing amount or billId" });
  }

  try {
    const bill = await Bill.findById(billId);
    if (!bill || bill.residentId.toString() !== req.user.id) {
       return res.status(403).json({ success: false, message: "Not authorized to pay this bill" });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
      console.error("Razorpay credentials not set");
      return res.status(500).json({ success: false, message: "Payment gateway not configured" });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100, // in paise
      currency: "INR",
      receipt: billId,
    });

    res.json({ success: true, order });
  } catch (err) {
    console.error("Razorpay order create error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      billId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !billId) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment verification data",
      });
    }

    if (!process.env.RAZORPAY_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Razorpay secret not configured",
      });
    }

    const generated = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Signature mismatch",
      });
    }

    const bill = await Bill.findById(billId);
    if (!bill || bill.residentId.toString() !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: "Bill not found or unauthorized",
      });
    }

    // Save payment
    const payment = await Payment.create({
      billId,
      societyId: bill.societyId,
      residentId: req.user.id,
      amount: bill.remainingAmount,
      paymentMode: "Online",
      transactionId: razorpay_payment_id,
    });

    // Update bill properly
    bill.paidAmount += payment.amount;
    bill.remainingAmount = bill.amount - bill.paidAmount;
    bill.status = bill.remainingAmount === 0 ? "Paid" : "Partial";

    await bill.save();

    res.json({ success: true, payment });
  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
