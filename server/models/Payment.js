import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
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
    billId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bill",
      required: true,
    },
    amount: { type: Number, required: true },
    paymentMode: { type: String, default: "Cash" }, // Cash / Online / Cheque
    paymentDate: { type: Date, default: Date.now },
    transactionId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", PaymentSchema);
