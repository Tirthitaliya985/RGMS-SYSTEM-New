// models/Activity.js
import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema(
  {
    username: { type: String, required: true }, // log username
    action: { type: String, required: true },   // action description
    time: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("Activity", ActivitySchema);
