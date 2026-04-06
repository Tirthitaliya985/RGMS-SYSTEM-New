import Attendance from "../models/Attendance.js";
import Staff from "../models/Staff.js";
import dayjs from "dayjs";
import WhatsAppservice from "../utils/whatsappService.js"; // or your axios instance for WhatsApp

// Mark attendance
export const markAttendance = async (req, res) => {
  try {
    const { staff, date, status } = req.body;

    if (!staff || !date || !status)
      return res.status(400).json({ message: "Staff, date, and status required" });

    const staffData = await Staff.findOne({
      _id: staff,
      societyId: req.user.societyId,
    });

    if (!staffData) {
      return res.status(404).json({ message: "Staff not found in your society" });
    }

    const attendance = await Attendance.create({
      staff: staffData._id,
      date: new Date(date),
      status,
    });

    // Emit Socket.IO update
    if (req.io) req.io.emit("attendanceUpdated");

    // WhatsApp notification
    if (staffData?.phone) {
      await WhatsAppservice.post("/whatsapp/send", {
        staffList: [staffData],
        message: `Hi ${staffData.name}, your attendance for ${dayjs(date).format(
          "DD MMM YYYY"
        )} is marked as ${status}.`,
      });
    }

    res.json(attendance);
  } catch (err) {
    console.error("Error marking attendance:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get all attendance
export const getAttendance = async (req, res) => {
  try {
    const staffIds = await Staff.find({ societyId: req.user.societyId })
      .select("_id")
      .lean();

    const ids = staffIds.map((s) => s._id);

    const data = await Attendance.find({ staff: { $in: ids } })
      .populate("staff")
      .sort({ date: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Auto-mark absent for unmarked staff
export const autoMarkAbsent = async (io) => {
  try {
    const today = dayjs().startOf("day").toDate();

    // Get all staff
    const allStaff = await Staff.find();

    // Get attendance already marked today
    const todayAttendance = await Attendance.find({
      date: { $gte: today },
    });

    const markedStaffIds = todayAttendance.map((a) => a.staff.toString());

    const unmarkedStaff = allStaff.filter(
      (s) => !markedStaffIds.includes(s._id.toString())
    );

    for (let staff of unmarkedStaff) {
      await Attendance.create({
        staff: staff._id,
        date: today,
        status: "Absent",
      });

      // WhatsApp notification
      if (staff.phone) {
        await WhatsAppservice.post("/whatsapp/send", {
          staffList: [staff],
          message: `Hi ${staff.name}, you were marked Absent for ${dayjs(today).format(
            "DD MMM YYYY"
          )}.`,
        });
      }
    }

    if (io) io.emit("attendanceUpdated");
    console.log(`Auto-marked ${unmarkedStaff.length} staff as Absent`);
  } catch (err) {
    console.error("Error in auto-marking absent:", err);
  }
};
