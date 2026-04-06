import express from "express";
import { protect, allowRoles } from "../../middleware/authMiddleware.js";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "../../controllers/wingAdmin/profileController.js";

const router = express.Router();

router.use(protect); // Auth middleware
router.use(allowRoles("wingadmin")); // Only wing admins

router.get("/", getProfile);
router.put("/", updateProfile);
router.put("/change-password", changePassword);

export default router;