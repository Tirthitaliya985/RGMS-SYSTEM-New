import express from "express";
import { getWingDashboard } from "../../controllers/wingAdmin/wingController.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Wing Dashboard Route
router.get("/dashboard", protect, getWingDashboard);

export default router;
