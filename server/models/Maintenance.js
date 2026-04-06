import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema(
  {
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
    },

    month: {
      type: String,
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    wingBills: [
      {
        wing: { type: mongoose.Schema.Types.ObjectId, ref: "Wing" },
        amount: Number,
      },
    ],

    residentBills: [
      {
        resident: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Resident",
        },
        amount: Number,
        dueDate: Date,
        isPaid: {
          type: Boolean,
          default: false,
        },
        paidAt: Date,
        paymentMethod: String,
        transactionId: String,

        // ✅ Added fields
        lateFee: {
          type: Number,
          default: 0,
        },
        finalAmount: Number,
      },
    ],

    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model("Maintenance", maintenanceSchema);