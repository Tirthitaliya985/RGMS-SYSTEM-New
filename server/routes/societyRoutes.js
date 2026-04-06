// server/routes/societyRoutes.js
import express from "express";
import { createSociety, getSocieties,deleteSociety ,updateSociety ,getSocietyById } from "../controllers/societyController.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, allowRoles("admin", "society"), createSociety);
router.put("/:id", protect, allowRoles("admin", "society"), updateSociety);
router.get("/:id", protect, allowRoles("admin", "society"), getSocietyById);
router.get("/", protect, allowRoles("admin", "society"), getSocieties);
router.delete("/:id", protect, allowRoles("admin", "society"), deleteSociety);

export default router;
