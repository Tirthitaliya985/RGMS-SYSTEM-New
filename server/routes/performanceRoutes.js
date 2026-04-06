import express from "express";
import Performance from "../models/Performance.js";

const router = express.Router();

// Create
router.post("/", async (req, res) => {
  const data = await Performance.create(req.body);
  res.json({ success: true, data });
});

// Get all
router.get("/", async (req, res) => {
  const data = await Performance.find().populate("staff");
  res.json({ success: true, data });
});

// Delete
router.delete("/:id", async (req, res) => {
  await Performance.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export default router;
