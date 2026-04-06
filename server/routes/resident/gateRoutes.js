import express from "express";
import { protect, allowRoles } from "../../middleware/authMiddleware.js";
import {
  getMyGateVisitors,
  getMyParcels,
  markMyParcelCollected,
  getMyEmergencyAlerts,
  createMyEmergencyAlert,
} from "../../controllers/resident/gateController.js";

const router = express.Router();

router.use(protect);
router.use(allowRoles("resident"));

router.get("/visitors", getMyGateVisitors);

router.get("/parcels", getMyParcels);
router.patch("/parcels/:id/collect", markMyParcelCollected);

router.get("/emergency-alerts", getMyEmergencyAlerts);
router.post("/emergency-alerts", createMyEmergencyAlert);

export default router;
