// utils/logger.js
import Activity from "../models/Activity.js";

export const logActivity = async (username, action) => {
  try {
    await Activity.create({ username, action });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
};
