import mongoose from "mongoose";
import Resident from "../models/Resident.js";
const connectDB = async () => {
  mongoose.set("strictQuery", true);
  mongoose.set("autoIndex", true);
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Resident.syncIndexes();
    console.log("MongoDB Connected");
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

export default connectDB;
