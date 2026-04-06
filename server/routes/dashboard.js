import express from "express";
import Societies from "../models/Society.js";
import users from "../models/User.js";
import Residents from "../models/Resident.js";
import Visitors from "../models/Visitor.js";
import Activities from "../models/Activity.js"; // log actions

const router = express.Router();

// @route   GET /dashboard/stats
// @desc    Get counts of societies, admins, residents, visitors
router.get("/stats", async (req, res) => {
  try {
    const [societies, user, residents, visitors] = await Promise.all([
      Societies.countDocuments(),
      users.countDocuments({ role: "admin" }),
      Residents.countDocuments(),
      Visitors.countDocuments(),
    ]);

    
    res.json({ societies, user, residents, visitors });
  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
});

// @route   GET /dashboard/activities
// @desc    Get last 5 activities
router.get("/activities", async (req, res) => {
  try {
    const activities = await Activities.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("username action createdAt")
      .lean();
    const formatted = activities.map((act, index) => ({
      key: index,
      username: act.username,
      action: act.action,
      time: new Date(act.createdAt).toLocaleString(),
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Dashboard Activities Error:", err);
    res.status(500).json({ message: "Failed to fetch recent activities" });
  }
});

export default router;
