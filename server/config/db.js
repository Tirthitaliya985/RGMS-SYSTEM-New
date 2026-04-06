import mongoose from "mongoose";
import Resident from "../models/Resident.js";
const connectDB = async () => {
  mongoose.set("strictQuery", true);
  mongoose.set("autoIndex", true);
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/lrsms"||"mongodb+srv://tirthitaliya985:tirth1234@tirth.20a8zfr.mongodb.net/lrsms");
    await Resident.syncIndexes();
    console.log("MongoDB Connected");
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

export default connectDB;
