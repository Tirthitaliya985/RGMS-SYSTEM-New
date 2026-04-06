const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
  staff: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },

  date: Date,
  checkIn: Date,
  checkOut: Date,

  status: {
    type: String,
    enum: ["Present", "Absent", "Leave"],
    default: "Present"
  }

}, { timestamps: true });

module.exports = mongoose.model("Attendance", AttendanceSchema);
