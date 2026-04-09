// controllers/maintenanceController.js
import mongoose from "mongoose";
import dayjs from "dayjs";
import Maintenance from "../../models/Maintenance.js";
import Wing from "../../models/wingModel.js";
import Resident from "../../models/Resident.js";
import { sendEmail } from "../../utils/notifications.js";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// Create Razorpay order
export const createRazorpayOrder = async (req, res) => {
  try {
    const residentId = req.user.id;
    const { maintenanceId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(maintenanceId)) {
      return res.status(400).json({ message: "Invalid maintenance ID" });
    }

    const maintenance = await Maintenance.findById(maintenanceId);

    if (!maintenance) {
      return res.status(404).json({ message: "Maintenance not found" });
    }

    const bill = maintenance.residentBills.find(
      (r) => r.resident.toString() === residentId.toString()
    );

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    if (bill.isPaid) {
      return res.status(400).json({ message: "Bill already paid" });
    }

    const amount = bill.finalAmount || bill.amount;

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `maintenance_${bill._id}`,
    });

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// ===============================
// Get Wing Maintenance Details (Wing Admin)
// ===============================
export const getWingMaintenanceDetails = async (req, res) => {
  try {
    const wingId = req.user.wing;
    const { id } = req.params; // maintenanceId

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid maintenance ID" });
    }

    const maintenance = await Maintenance.findById(id)
      .populate("residentBills.resident", "ownerName flatNo wing")
      .lean();

    if (!maintenance) {
      return res.status(404).json({ message: "Maintenance not found" });
    }

    // Filter only residents of this wing
    const wingResidents = maintenance.residentBills.filter(
      (bill) =>
        bill.resident &&
        bill.resident.wing.toString() === wingId.toString()
    );

    const data = wingResidents.map((bill) => ({
      residentId: bill.resident._id,
      ownerName: bill.resident.ownerName,
      flatNo: bill.resident.flatNo,
      amount: bill.amount,
      finalAmount: bill.finalAmount || bill.amount,
      dueDate: bill.dueDate,
      isPaid: bill.isPaid,
      paidAt: bill.paidAt,
      paymentMethod: bill.paymentMethod,
    }));

    res.json({
      success: true,
      month: maintenance.month,
      data,
    });
  } catch (error) {
    console.error("Wing maintenance details error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



export const generateMaintenance = async (req, res) => {
  try {
    const { month, totalAmount } = req.body;
    const societyId = req.user.societyId;

    if (!month || !totalAmount) {
      return res
        .status(400)
        .json({ message: "Month and total amount required" });
    }

    const selectedMonth = dayjs(month, "MMMM YYYY");

    if (!selectedMonth.isValid()) {
      return res.status(400).json({ message: "Invalid month format" });
    }

    // Prevent duplicate month
    const exists = await Maintenance.findOne({ societyId, month });
    if (exists) {
      return res.status(400).json({
        message: "Maintenance already generated for this month",
      });
    }

    const wings = await Wing.find({ society: societyId });

    if (!wings.length) {
      return res.status(400).json({ message: "No wings found" });
    }

    const wingAmount = Math.round(totalAmount / wings.length);

    const wingBills = wings.map((w) => ({
      wing: w._id,
      amount: wingAmount,
    }));

    const residentBills = [];

    for (const wing of wings) {
      const residents = await Resident.find({ wing: wing._id });

      if (!residents.length) continue;

      const perResidentAmount = Math.floor(wingAmount / residents.length);

      let assigned = 0;

      residents.forEach((resident, index) => {
        let amount;

        if (index === residents.length - 1) {
          amount = wingAmount - assigned;
        } else {
          amount = perResidentAmount;
          assigned += perResidentAmount;
        }

        residentBills.push({
          resident: resident._id,
          amount,
          dueDate: selectedMonth.endOf("month").toDate(),
          isPaid: false,
        });

        // Send Email
        if (resident.email) {
          sendEmail({
            to: resident.email,
            subject: "New Maintenance Bill",
            text: `Hello ${resident.ownerName}, 
Your maintenance for ${month} is ₹${amount}. 
Due date: ${selectedMonth.endOf("month").format("DD MMM YYYY")}`,
          });
        }
      });
    }

    const maintenance = await Maintenance.create({
      societyId,
      month,
      totalAmount,
      wingBills,
      residentBills,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Maintenance generated successfully",
      data: maintenance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

//Get maintenance by society (Society Admin)
export const getSocietyMaintenance = async (req, res) => {
  try {
    const societyId = req.user.societyId;
    const maintenance = await Maintenance.find({ societyId })
      .select("month totalAmount wingBills")
      .lean();
    res.json({ success: true, data: maintenance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getWingMaintenance = async (req, res) => {
  try {
    const wingId = req.user.wing;
    console.log(wingId);
    if (!wingId) {
      return res.status(400).json({ message: "Wing ID missing in user token" });
    }

    const maintenance = await Maintenance.find({
      "wingBills.wing": new mongoose.Types.ObjectId(wingId),
    })
      .select("month wingBills")
      .lean();

    const wingData = maintenance.map((m) => {
      const wingBill = m.wingBills.find(
        (w) => w.wing.toString() === wingId.toString(),
      );

      return {
        _id: m._id,
        month: m.month,
        amount: wingBill ? wingBill.amount : 0,
      };
    });

    res.json({ success: true, data: wingData });
  } catch (err) {
    console.error("Wing Maintenance Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get resident maintenance (Resident)
export const getResidentMaintenance = async (req, res) => {
  try {
    const residentId = req.user.id;
    const resident = await Resident.findById(residentId)
      .select("ownerName flatNo")
      .lean();

    const maintenance = await Maintenance.find(
      { "residentBills.resident": residentId },
      {
        month: 1,
        residentBills: { $elemMatch: { resident: residentId } },
      },
    ).lean();

    const bills = maintenance.map((m) => ({
      _id: m._id,
      month: m.month,
      amount: m.residentBills[0]?.amount,
      lateFee: m.residentBills[0]?.lateFee || 0,
      finalAmount:
        m.residentBills[0]?.finalAmount || m.residentBills[0]?.amount,
      dueDate: m.residentBills[0]?.dueDate,
      isPaid: m.residentBills[0]?.isPaid,
      paidAt: m.residentBills[0]?.paidAt,
      paymentMethod: m.residentBills[0]?.paymentMethod,
      residentName: resident?.ownerName,
      flatNo: resident?.flatNo,
    }));

    res.json({ success: true, data: bills });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteMaintenance = async (req, res) => {
  try {
    const { id } = req.params;

    const maintenance = await Maintenance.findById(id);

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: "Maintenance not found",
      });
    }

    await Maintenance.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Maintenance deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// controllers/maintenanceController.js
// ===============================
// Pay Maintenance
// ===============================
export const payMaintenance = async (req, res) => {
  try {
    const residentId = req.user.id;
    const { maintenanceId } = req.params;
    const { paymentMethod, transactionId } = req.body;

    if (!paymentMethod) {
      return res.status(400).json({ message: "Payment method required" });
    }

    if (!mongoose.Types.ObjectId.isValid(maintenanceId)) {
      return res.status(400).json({ message: "Invalid maintenance ID" });
    }

    const maintenance = await Maintenance.findOne({
      _id: maintenanceId,
      "residentBills.resident": residentId,
    });

    if (!maintenance) {
      return res.status(404).json({ message: "Maintenance not found" });
    }

    const bill = maintenance.residentBills.find(
      (b) => b.resident.toString() === residentId.toString()
    );

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    if (bill.isPaid) {
      return res.status(400).json({ message: "Already paid" });
    }

    // Late fee (5%)
    const today = new Date();
    if (today > bill.dueDate) {
      bill.lateFee = Math.round(bill.amount * 0.05);
      bill.finalAmount = bill.amount + bill.lateFee;
    } else {
      bill.finalAmount = bill.amount;
    }

    bill.isPaid = true;
    bill.paidAt = new Date();
    bill.paymentMethod = paymentMethod;
    bill.transactionId = transactionId || null;

    await maintenance.save();

    res.json({
      success: true,
      message: "Payment successful",
      data: bill,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
