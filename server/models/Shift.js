import mongoose from "mongoose";

const shiftSchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    shiftType: String,
    date: String,
    startTime: String,
    endTime: String,
  },
  { timestamps: true }
);

export default mongoose.model("Shift", shiftSchema);
