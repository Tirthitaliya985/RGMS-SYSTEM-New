const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
  staff: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },

  message: String,
  type: {
    type: String,
    enum: ["complaint", "feedback"]
  },

  status: {
    type: String,
    default: "open"
  }

}, { timestamps: true });

module.exports = mongoose.model("StaffFeedback", FeedbackSchema);
