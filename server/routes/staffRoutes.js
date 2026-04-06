import express from "express";
import {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
} from "../controllers/staffController.js";

import { protect,allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect,allowRoles("admin","society","wingadmin"), getStaff);
router.post("/", protect, allowRoles("admin","society"), createStaff);
router.put("/:id", protect,allowRoles("admin","society"), updateStaff);
router.delete("/:id", protect,allowRoles("admin","society"), deleteStaff);

export default router;
