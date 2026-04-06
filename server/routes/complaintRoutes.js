import express from "express";
import {getAllComplaints , createComplaint , updateComplaint , deleteComplaint } from "../controllers/complaintController.js";

// import verifyToken from "../middleware/verifyToken";
import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Auth middleware (optional but recommended)
// router.use(verifyToken);

router.get("/",protect,allowRoles("resident","society","windadmin"), getAllComplaints);
router.post("/",protect,allowRoles("resident","wingadmin"), createComplaint);
router.put("/:id", updateComplaint);
router.delete("/:id", deleteComplaint);
export default router;
