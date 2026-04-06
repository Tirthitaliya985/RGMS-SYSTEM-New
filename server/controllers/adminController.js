import { logActivity } from "../utils/logger.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const getAdmins = async (req, res) => {
  const { role } = req.query;
  const filter = role ? { role: String(role).toLowerCase() } : { role: /admin/i };
  const admins = await User.find(filter).select("-password");
  res.json(admins);
};

// Create Admin
export const createAdmin = async (req, res) => {
  try {
    const { username, email, phone, role, password, societyId } = req.body;
    if (!username || !email || !role || !password)
      return res.status(400).json({ message: "All fields required" });

     if (role === "society" && !societyId) {
    return res.status(400).json({ message: "Society is required for society admin" });
  }

    const checks = [{ email }, { username }];
    if (phone) checks.push({ phone });
    const exists = await User.findOne({ $or: checks });
    if (exists) return res.status(400).json({ message: "Email, username, or phone already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      username,
      email,
      phone: phone ? String(phone).trim() : null,
      role,
      password: hashedPassword,
      societyId: role === "society" ? societyId : null,
      active: true,
    });

    await logActivity(req.user.username, `Created admin: ${username}`); // log activity

    res.status(201).json(admin);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error creating admin" });
  }
};

// Update Admin
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, phone, role, password, active ,societyId  } = req.body;

    if (phone) {
      const existingPhone = await User.findOne({
        phone: String(phone).trim(),
        _id: { $ne: id },
      });
      if (existingPhone) {
        return res.status(400).json({ message: "Phone already exists" });
      }
    }

    const updateData = {
      username,
      email,
      phone: phone ? String(phone).trim() : null,
      role,
      active,
      societyId: role === "society" ? societyId : null,
    };
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const updatedAdmin = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password");

    await logActivity(req.user.username, `Updated admin: ${username}`); // log activity

    res.json(updatedAdmin);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error updating admin" });
  }
};

// Delete Admin
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await User.findById(id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    await User.findByIdAndDelete(id);

    await logActivity(req.user.username, `Deleted admin: ${admin.username}`); // log activity

    res.json({ message: "Admin deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error deleting admin" });
  }
};
