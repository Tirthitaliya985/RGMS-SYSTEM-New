import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema(
  {
    role: { type: String, required: true, unique: true },
    permissions: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Role", RoleSchema);
