import express from "express";
import * as noticeController from "../controllers/noticeController.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get(
  "/",
  allowRoles("society", "wingadmin", "resident", "guard", "admin", "super admin"),
  noticeController.getNotices
);
router.post("/", allowRoles("society"), noticeController.createNotice);
router.put("/:id", allowRoles("society"), noticeController.updateNotice);
router.delete("/:id", allowRoles("society"), noticeController.deleteNotice);

export default router;
