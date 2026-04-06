// server/models/Society.js
import mongoose from "mongoose";

const societySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 3 },
    location: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    contact: {
      type: String,
      required: true,
      match: /^[0-9]{10,15}$/,
    },
    units: { type: Number, required: true, min: 1 },
    amenities: [String],
    visitorRules: { type: Boolean, default: true },
    createdBy: { type: String },
  },
  { timestamps: true }
);
export default mongoose.model("Society", societySchema);
