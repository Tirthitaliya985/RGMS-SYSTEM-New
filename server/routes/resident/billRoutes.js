import express from "express";
import {
  getMyBills,
  createRazorpayOrder,
  verifyPayment,
} from "../../controllers/resident/billController.js";
import { protect, allowRoles } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(allowRoles("resident"));

router.get("/", getMyBills);
router.post("/razorpay/order", createRazorpayOrder);
router.post("/razorpay/verify", verifyPayment);

export default router;
