import mongoose from "mongoose";

const parcelSchema = new mongoose.Schema(
  {
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
      index: true,
    },
    courier: {
      type: String,
      trim: true,
      required: true,
    },
    trackingId: {
      type: String,
      trim: true,
      default: null,
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
    recipientName: {
      type: String,
      trim: true,
      default: null,
    },
    recipientPhone: {
      type: String,
      trim: true,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "collected", "returned"],
      default: "pending",
      index: true,
    },
    receivedAt: {
      type: Date,
      default: Date.now,
    },
    collectedAt: {
      type: Date,
      default: null,
    },
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    createdByRole: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Parcel", parcelSchema);
