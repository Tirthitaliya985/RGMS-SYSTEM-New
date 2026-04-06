import mongoose from "mongoose";

const SalarySchema = new mongoose.Schema({
  staff: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },

  month: String,
  year: Number,

  basicSalary: Number,
  bonus: Number,
  deduction: Number,

  totalPaid: Number,
  paymentStatus: {
    type: String,
    enum: ["paid", "pending"],
    default: "pending"
  }

}, { timestamps: true });

export default mongoose.model("Salary", SalarySchema);
