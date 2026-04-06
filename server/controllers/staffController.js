import Staff from "../models/Staff.js";
import Audit from "../models/Audit.js";

const GUARD_ROLE = "guard";

/* ================= GET STAFF ================= */
export const getStaff = async (req, res) => {
  try {
    const staff = await Staff.find({ societyId: req.user.societyId }).sort({ createdAt: -1 });

    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= CREATE STAFF ================= */
export const createStaff = async (req, res) => {
  try {
    const payload = { ...req.body, societyId: req.user.societyId };
    const role = String(payload.role || "").toLowerCase();
    const password = String(payload.password || "").trim();

    if (role === GUARD_ROLE && !password) {
      return res.status(400).json({ message: "Password is required for guard role" });
    }

    if (role !== GUARD_ROLE) {
      delete payload.password;
    } else {
      payload.password = password;
    }

    const staff = new Staff({
      ...payload,
    });
    console.log("Creating staff for society:", req.user.societyId);

    await staff.save();

    /* Audit Log */
    await Audit.create({
      action: "CREATE_STAFF",
      user: req.user._id,
      description: `Staff created: ${staff.name}`,
    });

    /* Socket Emit */
    req.io.emit("staffCreated", staff);

    res.status(201).json(staff);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ================= UPDATE STAFF ================= */
export const updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findOne({
      _id: req.params.id,
      societyId: req.user.societyId,
    }).select("+password");

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    const payload = { ...req.body };
    const nextRole = String(payload.role || staff.role || "").toLowerCase();
    const incomingPassword = String(payload.password || "").trim();

    Object.assign(staff, payload);

    if (nextRole === GUARD_ROLE) {
      if (incomingPassword) {
        staff.password = incomingPassword;
      } else if (!staff.password) {
        return res.status(400).json({ message: "Password is required for guard role" });
      }
    } else {
      staff.password = null;
    }

    await staff.save();

    await Audit.create({
      action: "UPDATE_STAFF",
      user: req.user._id,
      description: `Updated staff: ${staff.name}`,
    });

    req.io.emit("staffUpdated", staff);

    res.json(staff);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ================= DELETE STAFF ================= */
export const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findOneAndDelete({
      _id: req.params.id,
      societyId: req.user.societyId,
    });

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    await Audit.create({
      action: "DELETE_STAFF",
      user: req.user._id,
      description: `Deleted staff: ${staff.name}`,
    });

    req.io.emit("staffDeleted", staff._id);

    res.json({ message: "Staff deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
