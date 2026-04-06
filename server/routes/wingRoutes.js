import express from "express";
import Wing from "../models/wingModel.js";
import WingAdmin from "../models/wingAdminModel.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


// ✅ Create Wing
router.post("/", protect, async (req, res) => {
  try {
    const wing = await Wing.create({
      ...req.body,
      societyId: req.user.societyId,
    });

    res.json({ success: true, data: wing });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ Get All Wings With Admin
router.get("/", protect, async (req, res) => {
  try {
    const wings = await Wing.find({
      societyId: req.user.societyId,
    });

    const result = await Promise.all(
      wings.map(async (wing) => {
        const admin = await WingAdmin.findOne({ wing: wing._id });

        return {
          ...wing.toObject(),
          admin,
        };
      })
    );

    res.json({ success: true, data: result });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ Update Wing
router.put("/:id", protect, async (req, res) => {
  try {
    const wing = await Wing.findOneAndUpdate(
      { _id: req.params.id, societyId: req.user.societyId },
      req.body,
      { new: true }
    );

    res.json({ success: true, data: wing });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ Delete Wing
router.delete("/:id", protect, async (req, res) => {
  try {
    await Wing.deleteOne({
      _id: req.params.id,
      societyId: req.user.societyId,
    });

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
