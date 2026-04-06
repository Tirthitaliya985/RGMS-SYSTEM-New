import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: String,
    email: { type: String, unique: true },
    phone: {
      type: String,
      default: null,
      trim: true,
    },
    password: String,
    role: {
      type: String,
      enum: ["admin", "society", "resident"],
      default: "resident",
    },
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
    },
    resetPasswordOtp: {
      type: String,
      default: null,
    },
    resetPasswordOtpExpiry: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
