import WingAdmin from "../../models/wingAdminModel.js";
import bcrypt from "bcryptjs";

// GET PROFILE
export const getProfile = async (req, res) => {
  try {
    const admin = await WingAdmin.findById(req.user._id)
      .select("-password")
      .populate("wing", "wing"); // get wing name

    if (!admin)
      return res.status(404).json({ message: "Profile not found" });

    res.json({
      success: true,
      data: {
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        wingName: admin.wing?.wing, // wing letter (A/B/C)
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Wing Profile
export const updateProfile = async (req, res) => {
  try {
    const admin = await WingAdmin.findById(req.user._id);

    if (!admin)
      return res.status(404).json({ message: "Profile not found" });

    admin.name = req.body.name || admin.name;
    admin.email = req.body.email || admin.email;
    admin.phone = req.body.phone || admin.phone;

    await admin.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Update failed" });
  }
};
// Change Password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const admin = await WingAdmin.findById(req.user._id);

    if (!admin)
      return res.status(404).json({ message: "Profile not found" });

    const isMatch = await admin.matchPassword(currentPassword);

    if (!isMatch)
      return res.status(400).json({ message: "Current password incorrect" });

    admin.password = newPassword;
    await admin.save(); // pre-save hook will hash

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Password change failed" });
  }
};