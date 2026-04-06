import { logActivity } from "../utils/logger.js";
import Role from "../models/Role.js";


export const getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (err) {
    console.error("GET /roles error:", err);
    res.status(500).json({ message: "Server error fetching roles" });
  }
};
// Create Role
export const createRole = async (req, res) => {
  try {
    const { role, permissions } = req.body;
    if (!role) return res.status(400).json({ message: "Role is required" });

    const exists = await Role.findOne({ role });
    if (exists) return res.status(400).json({ message: "Role already exists" });

    const newRole = await Role.create({ role, permissions });

    await logActivity(req.user.username, `Created role: ${role}`);

    res.status(201).json(newRole);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error creating role" });
  }
};

// Update Role
export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, permissions } = req.body;

    const updatedRole = await Role.findByIdAndUpdate(id, { role, permissions }, { new: true });
    if (!updatedRole) return res.status(404).json({ message: "Role not found" });

    await logActivity(req.user.username, `Updated role: ${role}`);

    res.json(updatedRole);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error updating role" });
  }
};

// Delete Role
export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findById(id);
    if (!role) return res.status(404).json({ message: "Role not found" });

    await Role.findByIdAndDelete(id);

    await logActivity(req.user.username, `Deleted role: ${role.role}`);

    res.json({ message: "Role deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error deleting role" });
  }
};
