import express from "express";
import {
  registerUser,
  loginUser,
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPasswordWithOtp,
  getMyProfile,
  updateMyProfile,
  logoutUser,
} from "../controllers/authController.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/forgot-password/request-otp", requestPasswordResetOtp);
router.post("/forgot-password/verify-otp", verifyPasswordResetOtp);
router.post("/forgot-password/reset", resetPasswordWithOtp);
router.get("/me", protect, allowRoles("society"), getMyProfile);
router.put("/me", protect, allowRoles("society"), updateMyProfile);

export default router;
