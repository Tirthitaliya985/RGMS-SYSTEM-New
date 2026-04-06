import Resident from "../../models/Resident.js";
import Maintenance from "../../models/Maintenance.js";
import mongoose from "mongoose";

// Add Resident
export const addResident = async (req, res) => {
  try {
    const { ownerName, email, password, phone, flatNo, status, wing } = req.body;
    const societyId = req.user.societyId;

    // Check duplicate flat in wing
    const existsFlat = await Resident.findOne({ wing, flatNo, isDeleted: false });
    if (existsFlat) return res.status(400).json({ message: "Flat already occupied" });

    // Check duplicate email
    const existsEmail = await Resident.findOne({ email, isDeleted: false });
    if (existsEmail) return res.status(400).json({ message: "Email already used" });

    // Create resident
    const resident = await Resident.create({
      ownerName,
      email,
      password,
      phone,
      flatNo,
      status,
      wing,
      societyId,
    });

    res.status(201).json({ success: true, data: resident });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Wing Residents
export const getWingResidents = async (req, res) => {
  try {
    const wingId = req.user.wing;
    const residents = await Resident.find({ wing: wingId })
      .select("-password")
      .lean();

    // Optionally, check maintenance status
    const maintenance = await Maintenance.find({ "residentBills.resident": { $in: residents.map(r => r._id) } }).lean();

    const data = residents.map(r => {
      const bill = maintenance.find(m =>
        m.residentBills.some(rb => rb.resident.toString() === r._id.toString())
      );
      const residentBill = bill?.residentBills.find(rb => rb.resident.toString() === r._id.toString());

      return {
        ...r,
        isPaid: residentBill?.isPaid || false,
        overdue: residentBill?.dueDate && new Date() > new Date(residentBill.dueDate) && !residentBill?.isPaid,
      };
    });

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Resident
export const updateResident = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const resident = await Resident.findById(id);
    if (!resident) return res.status(404).json({ message: "Resident not found" });

    // Prevent flat duplication
    if (updates.flatNo && updates.wing) {
      const existsFlat = await Resident.findOne({
        _id: { $ne: id },
        wing: updates.wing,
        flatNo: updates.flatNo,
        isDeleted: false,
      });
      if (existsFlat) return res.status(400).json({ message: "Flat already occupied" });
    }

    Object.assign(resident, updates);
    await resident.save();
    res.json({ success: true, data: resident });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Resident
export const deleteResident = async (req, res) => {
  try {
    const { id } = req.params;
    const resident = await Resident.findById(id);
    if (!resident) return res.status(404).json({ message: "Resident not found" });

    resident.isDeleted = true;
    resident.deletedAt = new Date();
    await resident.save();

    res.json({ success: true, message: "Resident deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Restore Resident
export const restoreResident = async (req, res) => {
  try {
    const { id } = req.params;
    const resident = await Resident.findById(id);
    if (!resident) return res.status(404).json({ message: "Resident not found" });

    resident.isDeleted = false;
    resident.deletedAt = null;
    await resident.save();

    res.json({ success: true, message: "Resident restored" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Upload Documents
export const uploadResidentDocuments = async (req, res) => {
  try {
    const residentId = req.params.id;
    if (!req.files || req.files.length === 0) return res.status(400).json({ message: "No files uploaded" });

    const documents = req.files.map(f => f.path);

    await Resident.findByIdAndUpdate(residentId, {
      $push: { documents },
    });

    res.json({ success: true, files: documents });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
};

// Get Resident Maintenance History
export const getResidentMaintenance = async (req, res) => {
  try {
    const residentId = req.params.id;

    const maintenance = await Maintenance.find(
      { "residentBills.resident": residentId },
      { month: 1, residentBills: { $elemMatch: { resident: residentId } } }
    ).lean();

    const bills = maintenance.map(m => ({
      _id: m._id,
      month: m.month,
      amount: m.residentBills[0]?.amount,
      lateFee: m.residentBills[0]?.lateFee || 0,
      finalAmount: m.residentBills[0]?.finalAmount || m.residentBills[0]?.amount,
      dueDate: m.residentBills[0]?.dueDate,
      isPaid: m.residentBills[0]?.isPaid,
      paidAt: m.residentBills[0]?.paidAt,
      paymentMethod: m.residentBills[0]?.paymentMethod,
    }));

    res.json({ success: true, data: bills });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};