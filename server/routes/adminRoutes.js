import express from "express";
import { protect, allowRoles } from "../middleware/authMiddleware.js";
import { getAdmins, createAdmin, updateAdmin, deleteAdmin } from "../controllers/adminController.js";

const router = express.Router();

router.use(protect, allowRoles("admin")); // Only admins

router.get("/", getAdmins);
router.post("/", createAdmin);
router.put("/:id", updateAdmin);
router.delete("/:id", deleteAdmin);

export default router;
