import Audit from "../models/Audit.js";

export const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", action, model, role } = req.query;
    const normalizedRole = String(req.user?.role || "").toLowerCase();

    const query = {};

    // Non-admin roles only see their own audit entries
    if (!["admin", "super admin"].includes(normalizedRole)) {
      query.performedBy = req.user._id;
    }

    // Search
    if (search) {
      query.$or = [
        { action: { $regex: search, $options: "i" } },
        { model: { $regex: search, $options: "i" } },
        { recordName: { $regex: search, $options: "i" } },
        { performedByName: { $regex: search, $options: "i" } },
        { performedByRole: { $regex: search, $options: "i" } },
      ];
    }

    // Filter
    if (action) query.action = action;
    if (model) query.model = model;
    if (role) query.performedByRole = role;

    const logs = await Audit.find(query)
      .populate("performedBy", "username email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Audit.countDocuments(query);

    res.json({
      logs,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAuditMeta = async (req, res) => {
  try {
    const normalizedRole = String(req.user?.role || "").toLowerCase();
    const baseQuery =
      ["admin", "super admin"].includes(normalizedRole) ? {} : { performedBy: req.user._id };

    const actions = await Audit.distinct("action", baseQuery);
    const models = await Audit.distinct("model", baseQuery);
    const roles = await Audit.distinct("performedByRole", baseQuery);

    res.json({ actions, models, roles });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
