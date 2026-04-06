import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema(
  {
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
      index: true,
    },
    wingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wing",
      required: true,
      index: true,
    },
    residentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resident",
      required: true,
      index: true,
    },
    visitorName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    purpose: {
      type: String,
      required: true,
      trim: true,
    },
    deliveryPartner: {
      type: String,
      trim: true,
      default: null,
    },
    photo: {
      type: String,
      trim: true,
      default: null,
    },
    scheduledFor: {
      type: Date,
      required: true,
      index: true,
    },
    vehicleNumber: {
      type: String,
      trim: true,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: null,
    },
    qrToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    qrCodeData: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "arrived", "exited", "cancelled"],
      default: "pending",
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    createdByRole: {
      type: String,
      required: true,
      enum: ["resident", "wingadmin", "society", "guard"],
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    approvalNote: {
      type: String,
      trim: true,
      default: null,
    },
    arrivedAt: {
      type: Date,
      default: null,
    },
    arrivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    exitedAt: {
      type: Date,
      default: null,
    },
    exitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    statusTimeline: [
      {
        status: {
          type: String,
          enum: ["pending", "approved", "rejected", "arrived", "exited", "cancelled"],
          required: true,
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        actorRole: {
          type: String,
          required: true,
        },
        note: {
          type: String,
          default: null,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Visitor", visitorSchema);
