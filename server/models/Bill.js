import mongoose from "mongoose";

const BillSchema = new mongoose.Schema(
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
    flatNo: { type: String, required: true },
    month: { type: String, required: true },   // e.g., "2026-01"
    amount: { type: Number, required: true },
    status: { type: String, default: "Pending" }, // Pending / Paid / Partial
    dueDate: { type: Date, required: true },
    paidAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Bill", BillSchema);
