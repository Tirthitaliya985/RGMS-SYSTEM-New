import express from "express";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} from "../controllers/roleController.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only Super Admins and Admins can manage roles
router.use(protect, allowRoles("Super Admin", "admin"));

router.get("/", getRoles);
router.post("/", createRole);
router.put("/:id", updateRole);
router.delete("/:id", deleteRole);

export default router;
