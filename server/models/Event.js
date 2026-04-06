import mongoose from "mongoose";

const attendeeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    enum: ["Going", "Maybe", "Declined"],
    default: "Maybe",
  },
  checkedIn: {
    type: Boolean,
    default: false,
  },
});

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    eventDate: { type: Date, required: true },
    location: String,
    color: String,
    attendees: [attendeeSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
