import mongoose from "mongoose";

const AuditSchema = new mongoose.Schema(
  {
    action: String,
    model: String,
    recordId: mongoose.Schema.Types.ObjectId,
    recordName: {
      type: String,
      default: "",
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    performedByName: String,
    performedByRole: String,
    societyId: mongoose.Schema.Types.ObjectId,
    endpoint: String,
    method: String,
    statusCode: Number,
    oldData: Object,
    newData: Object,
  },
  { timestamps: true }
);

export default mongoose.model("Audit", AuditSchema);
