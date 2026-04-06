import Resident from "../../models/Resident.js";
import Audit from "../../models/Audit.js";

// await Resident.syncIndexes();
export const addResident = async (req, res) => {
  try {
    const { flatNo, ownerName, email, password, phone, status, wing } =
      req.body;

    const resident = await Resident.create({
      societyId: req.user.societyId,
      wing,
      flatNo,
      ownerName,
      email,
      password,
      phone,
      status,
    });
    await resident.populate("wing", "wing code");

    // Audit log
    await Audit.create({
      action: "CREATE",
      model: "Resident",
      recordId: null,
      recordName: resident.ownerName,
      performedBy: req.user._id,
      performedByName: req.user.username,
      societyId: req.user.societyId,
      newData: resident,
    });

    // Real-time update
    req.io.emit("residentCreated", resident);

    res.status(201).json(resident);
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];

      return res.status(400).json({
        message: `${field} already exists`,
      });
    }

    res.status(500).json({ message: err.message });
  }
};

export const getResidents = async (req, res) => {
  try {
    const residents = await Resident.find({
      societyId: req.user.societyId,
      isDeleted: false,
    }).populate("wing", "wing code");
    res.json(residents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateResident = async (req, res) => {
  try {
    const resident = await Resident.findById(req.params.id);
    if (!resident) return res.status(404).json({ message: "Not found" });

    if (resident.societyId.toString() !== req.user.societyId.toString())
      return res.status(403).json({ message: "Not allowed" });

    const oldData = { ...resident._doc };

    Object.assign(resident, req.body);
    await resident.save();
    await resident.populate("wing", "wing code");
    // Audit log
    await Audit.create({
      action: "UPDATE",
      model: "Resident",
      recordId: null,
      recordName: resident.ownerName,
      performedBy: req.user.id,
      performedByName: req.user.username,
      societyId: req.user.societyId,
      oldData,
      newData: resident,
    });

    // Real-time update
    req.io.emit("residentUpdated", resident);

    res.json(resident);
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];

      return res.status(400).json({
        message: `${field} already exists`,
      });
    }

    res.status(500).json({ message: err.message });
  }
};

export const deleteResident = async (req, res) => {
  try {
    const resident = await Resident.findById(req.params.id);
    if (!resident) return res.status(404).json({ message: "Not found" });

    if (resident.societyId.toString() !== req.user.societyId.toString())
      return res.status(403).json({ message: "Not allowed" });

    // Soft delete
    resident.isDeleted = true;
    resident.deletedAt = new Date();
    await resident.save();

    // Audit log
    await Audit.create({
      action: "DELETE",
      model: "Resident",
      recordId: null,
      recordName: resident.ownerName,
      performedBy: req.user.id,
      performedByName: req.user.username,
      societyId: req.user.societyId,
      oldData: resident,
    });

    // Real-time update
    req.io.emit("residentDeleted", resident._id);

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const restoreResident = async (req, res) => {
  try {
    const resident = await Resident.findById(req.params.id);
    if (!resident) return res.status(404).json({ message: "Not found" });

    resident.isDeleted = false;
    resident.deletedAt = null;
    await resident.save();
    await resident.populate("wing", "wing code");
    // Audit log
    await Audit.create({
      action: "RESTORE",
      model: "Resident",
      recordId: null,
      recordName: resident.ownerName,
      performedBy: req.user.id,
      performedByName: req.user.username,
      societyId: req.user.societyId,
      newData: resident,
    });

    // Real-time update
    req.io.emit("residentRestored", resident);

    res.json({ message: "Restored", resident });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
