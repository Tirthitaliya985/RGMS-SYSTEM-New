import mongoose from "mongoose";

const ComplaintSchema = new mongoose.Schema(
  {
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
    },
    residentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resident",
      required: true,
    },
    residentName: {
      type: String,
      required: true,
    },
    wing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wing",
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved"],
      default: "Pending",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Complaint", ComplaintSchema);