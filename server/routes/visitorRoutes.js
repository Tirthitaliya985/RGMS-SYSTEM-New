import express from "express";
import { protect, allowRoles } from "../middleware/authMiddleware.js";
import {
  registerVisitor,
  getMyVisitors,
  getMyPendingApprovals,
  updateVisitorApproval,
  updateGateApproval,
  getVisitorsForGate,
  getVisitorByQr,
  markVisitorArrived,
  markVisitorExit,
} from "../controllers/visitorController.js";

const router = express.Router();

router.use(protect);

router.post(
  "/register",
  allowRoles("resident", "wingadmin", "society", "guard"),
  registerVisitor
);
router.get("/my", allowRoles("resident"), getMyVisitors);
router.get("/my/pending", allowRoles("resident"), getMyPendingApprovals);
router.patch("/:id/approval", allowRoles("resident"), updateVisitorApproval);

router.get("/gate", allowRoles("wingadmin", "society", "guard"), getVisitorsForGate);
router.get("/qr/:token", allowRoles("wingadmin", "society", "guard"), getVisitorByQr);
router.patch("/arrival", allowRoles("wingadmin", "society", "guard"), markVisitorArrived);
router.patch("/exit", allowRoles("wingadmin", "society", "guard"), markVisitorExit);
router.patch(
  "/:id/gate-approval",
  allowRoles("wingadmin", "society", "guard"),
  updateGateApproval
);

export default router;
