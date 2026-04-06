import express from "express";
import { protect, allowRoles } from "../middleware/authMiddleware.js";
import { createOrUpdateSalary, getSalaries,  deleteSalary, generateMonthlySalaries, autoCreateSalary } from "../controllers/salaryController.js";

const router = express.Router();

router.post("/", protect, allowRoles("admin","society"), createOrUpdateSalary);
router.get("/", protect, allowRoles("admin","society"), getSalaries);
router.put("/:id", protect, allowRoles("admin","society"), createOrUpdateSalary);
router.delete("/:id", protect, allowRoles("admin","society"), deleteSalary);
router.post("/auto-create", protect, allowRoles("admin","society"), autoCreateSalary);
router.post("/generate", protect, allowRoles("admin"), generateMonthlySalaries);

export default router;
