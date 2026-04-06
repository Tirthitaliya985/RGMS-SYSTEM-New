import express from "express";
import {
  generateBills,
  getBills,
  getBillById,
  updateBillStatus,
  deleteBill,
} from "../../controllers/society/billController.js";
import { protect, allowRoles } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(allowRoles("society"));

router.post("/generate", generateBills);
router.get("/", getBills);
router.get("/:id", getBillById);
router.put("/:id", updateBillStatus);
router.delete("/:id", deleteBill);

export default router;
