import express from "express";
import { protect, allowRoles } from "../middleware/authMiddleware.js";
import {
  getGuardVisitors,
  createEmergencyAlert,
  listEmergencyAlerts,
  resolveEmergencyAlert,
  createParcel,
  listParcels,
  markParcelCollected,
} from "../controllers/guardController.js";

const router = express.Router();

router.use(protect);
router.use(allowRoles("guard", "wingadmin", "society"));

router.get("/visitors", getGuardVisitors);

router.post("/emergency-alerts", createEmergencyAlert);
router.get("/emergency-alerts", listEmergencyAlerts);
router.patch("/emergency-alerts/:id/resolve", resolveEmergencyAlert);

router.post("/parcels", createParcel);
router.get("/parcels", listParcels);
router.patch("/parcels/:id/collect", markParcelCollected);

export default router;
