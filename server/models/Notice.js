import mongoose from "mongoose";
const NoticeSchema = new mongoose.Schema({
  title: String,
  description: String,
  attachment: String,
  priority: {
    type: String,
    enum: ["Normal", "Important"],
    default: "Normal"
  },
  audience: {
    type: String,
    enum: ["All", "Building", "Flat"],
    default: "All"
  },
  building: String,
  flat: String,
  expiryDate: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SocietyAdmin"
  }
}, { timestamps: true });

export default mongoose.model("Notice", NoticeSchema);
