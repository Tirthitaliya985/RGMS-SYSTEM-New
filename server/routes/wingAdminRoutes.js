import express from "express";
import WingAdmin from "../models/wingAdminModel.js";
import jwt from "jsonwebtoken";
import { protect } from "../middleware/authMiddleware.js";
import bcrypt from "bcryptjs";

const router = express.Router();


// ✅ Create Wing Admin
router.post("/", protect, async (req, res) => {
  try {
    const admin = await WingAdmin.create({
      ...req.body,
      societyId: req.user.societyId,
    });

    res.json({ success: true, data: admin });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ Get Wing Admins (Society Wise)
router.get("/", protect, async (req, res) => {
  try {
    const admins = await WingAdmin.find({
      societyId: req.user.societyId,
    }).populate("wing");

    res.json({ success: true, data: admins });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ Update Wing Admin

router.put("/:id", protect, async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const admin = await WingAdmin.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    res.json({ success: true, data: admin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ Delete Wing Admin
router.delete("/:id", protect, async (req, res) => {
  try {
    await WingAdmin.findByIdAndDelete(req.params.id);

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ Wing Admin Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await WingAdmin.findOne({ email }).populate("wing");

    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        role: "wingAdmin",
        wingId: admin.wing._id,
        societyId: admin.societyId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      wingAdmin: admin,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
