import mongoose from "mongoose";

const performanceSchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    category: String,
    rating: Number,
    comment: String,
  },
  { timestamps: true }
);

export default mongoose.model("Performance", performanceSchema);
