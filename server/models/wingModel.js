import mongoose from "mongoose";

const wingSchema = new mongoose.Schema(
  {
    wing: {
      type: String,
      required: true, // Example: A, B, C
    },

    code: {
      type: String,
      required: true,
    },

    totalFloors: {
      type: Number,
      required: true,
    },

    totalFlats: {
      type: Number,
      required: true,
    },

    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Wing", wingSchema);
