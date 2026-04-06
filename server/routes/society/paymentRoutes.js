import express from "express";
import {
  addPayment,
  getPayments,
  getPaymentById,
  verifyPayment,
  createRazorpayOrder,
} from "../../controllers/society/paymentController.js";

import { protect, allowRoles } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(allowRoles("society"));

router.post("/verify-payment", verifyPayment);
router.post("/razorpay/order", protect, createRazorpayOrder);
router.post("/razorpay/verify", protect, verifyPayment);

router.post("/", addPayment);
router.get("/", getPayments);
router.get("/:id", getPaymentById);

export default router;
