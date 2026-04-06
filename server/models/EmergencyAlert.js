import mongoose from "mongoose";

const emergencyAlertSchema = new mongoose.Schema(
  {
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["Medical", "Fire", "Security", "Lift", "Other"],
      required: true,
      default: "Security",
    },
    wing: {
      type: String,
      trim: true,
      default: null,
    },
    flatNo: {
      type: String,
      trim: true,
      required: true,
    },
    details: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: ["open", "resolved"],
      default: "open",
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    createdByRole: {
      type: String,
      required: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    notification: {
      attemptedAt: {
        type: Date,
        default: null,
      },
      sent: {
        type: Number,
        default: 0,
      },
      failed: {
        type: Number,
        default: 0,
      },
      reason: {
        type: String,
        default: null,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("EmergencyAlert", emergencyAlertSchema);
