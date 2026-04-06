import express from "express";
import { getActivities, createActivity , markActivitiesRead } from "../controllers/activityController.js";
import { getAuditLogs , getAuditMeta} from "../controllers/auditController.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// All authenticated roles can access activity/audit APIs
router.use(protect, allowRoles("super admin", "admin", "society", "wingadmin", "resident"));

router.get("/", getActivities);
router.post("/", createActivity);
router.post("/mark-read", markActivitiesRead);
router.get("/audit", getAuditLogs);
router.get("/audit/meta", getAuditMeta);


export default router;
