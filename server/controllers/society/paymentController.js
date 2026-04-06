import Payment from "../../models/Payment.js";
import Bill from "../../models/Bill.js";
import Audit from "../../models/Audit.js";
import razorpay from "../../utils/razorpay.js";
import crypto from "crypto";

export const addPayment = async (req, res) => {
  try {
    const { billId, amount, paymentMode, transactionId } = req.body;

    const bill = await Bill.findById(billId);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    // Validate amount
    const paymentAmount = Number(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ message: "Payment amount must be greater than zero." });
    }
    if (paymentAmount > bill.remainingAmount) {
      return res.status(400).json({ 
        message: `Payment amount (₹${paymentAmount}) cannot exceed the remaining due amount (₹${bill.remainingAmount}).` 
      });
    }

    // Create payment record
    const payment = await Payment.create({
      societyId: req.user.societyId,
      residentId: bill.residentId,
      billId,
      amount: paymentAmount,
      paymentMode,
      transactionId,
    });

    // Update bill status
    bill.paidAmount += paymentAmount;
    bill.remainingAmount = bill.amount - bill.paidAmount;
    bill.status = bill.remainingAmount === 0 ? "Paid" : "Partial";
    await bill.save();

    // Audit log
    await Audit.create({
      action: "CREATE",
      model: "Payment",
      recordId: payment._id,
      recordName: bill.flatNo,
      performedBy: req.user.id,
      performedByName: req.user.username,
      societyId: req.user.societyId,
      newData: payment,
    });

    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      societyId: req.user.societyId,
    }).populate("residentId", "ownerName flatNo");

    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Not found" });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const createRazorpayOrder = async (req, res) => {
  const { amount, billId } = req.body;
  if (!amount || !billId) {
    return res.status(400).json({ success: false, message: "Missing amount or billId" });
  }
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
    console.error("Razorpay credentials not set");
    return res.status(500).json({ success: false, message: "Payment gateway not configured" });
  }
  try {
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
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    // Society security check
    if (bill.societyId.toString() !== req.user.societyId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not allowed",
      });
    }

    // Save payment
    const payment = await Payment.create({
      billId,
      societyId: req.user.societyId,
      residentId: bill.residentId,
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