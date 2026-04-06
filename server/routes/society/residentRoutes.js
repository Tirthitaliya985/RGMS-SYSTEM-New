import express from "express";
import {
  addResident,
  getResidents,
  updateResident,
  deleteResident,
  restoreResident,
} from "../../controllers/society/residentController.js";
import { protect, allowRoles } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(allowRoles("society"));

router.post("/", addResident);
router.get("/", getResidents);
router.put("/:id", updateResident);
router.delete("/:id", deleteResident);
router.put("/restore/:id", restoreResident);

export default router;
