const AdminComplaint = require("../models/AdminComplaint");
const Notification = require("../models/Notification");

// Get all complaints
exports.getAllAdminComplaints = async (req, res) => {
  try {
    const complaints = await AdminComplaint.find()
      .populate("societyId", "name")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create complaint (from society)
exports.createAdminComplaint = async (req, res) => {
  try {
    const { subject, description } = req.body;
    console.log("REQ BODY:", req.body);
    console.log("USER:", req.user);

    const complaint = await AdminComplaint.create({
      societyId: req.user.societyId,
      subject,
      description,
    });


    res.status(201).json({ success: true, data: complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Reply to complaint
exports.replyToComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    const complaint = await AdminComplaint.findByIdAndUpdate(
      id,
      { reply, status: "Resolved" },
      { new: true }
    );

    // Create notification
    const notification = await Notification.create({
      societyId: complaint.societyId,
      title: "Complaint Resolved",
      message: reply,
    });

    // Emit notification via socket.io
    req.io.to(String(complaint.societyId)).emit("newNotification", notification);

    res.status(200).json({ success: true, data: complaint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete complaint
exports.deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    await AdminComplaint.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Complaint deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
