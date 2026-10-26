import express from "express";
import Shift from "../models/Shift.js";

const router = express.Router();

// Create Shift
router.post("/", async (req, res) => {
  const shift = await Shift.create(req.body);
  res.json({ success: true, data: shift });
});

// Get All Shifts
router.get("/", async (req, res) => {
  const shifts = await Shift.find().populate("staff");
  res.json({ success: true, data: shifts });
});

// Delete Shift
router.delete("/:id", async (req, res) => {
  await Shift.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export default router;

