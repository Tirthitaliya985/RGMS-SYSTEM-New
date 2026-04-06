import express from "express";
import { markAttendance, getAttendance } from "../controllers/attendanceController.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(allowRoles("admin", "society", "wingadmin"));

router.post("/", markAttendance);
router.get("/", getAttendance);

export default router;
