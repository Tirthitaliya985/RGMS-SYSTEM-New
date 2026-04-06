import express from "express";
import {
  generateMaintenance,
  getWingMaintenance,
  getSocietyMaintenance,
  getResidentMaintenance,
  deleteMaintenance,
  payMaintenance,
  getWingMaintenanceDetails,
  createRazorpayOrder,
} from "../../controllers/society/maintenanceController.js";

import { protect, allowRoles } from "../../middleware/authMiddleware.js";

const router = express.Router();

// ================= SOCIETY =================
router.post("/society", protect, allowRoles("society"), generateMaintenance);
router.get("/society", protect, allowRoles("society"), getSocietyMaintenance);

// ================= WING =================
router.get("/wing", protect, allowRoles("wingadmin"), getWingMaintenance);
router.get("/wing/details/:id", protect, getWingMaintenanceDetails);
// ================= RESIDENT =================
router.get("/resident", protect, allowRoles("resident"), getResidentMaintenance);

// 🔥 IMPORTANT: Specific route FIRST
router.post(
  "/pay/create-order",
  protect,
  allowRoles("resident"),
  createRazorpayOrder
);

// 🔥 Dynamic route AFTER
router.post(
  "/pay/:maintenanceId",
  protect,
  allowRoles("resident"),
  payMaintenance
);

router.delete("/:id", protect, deleteMaintenance);

export default router;