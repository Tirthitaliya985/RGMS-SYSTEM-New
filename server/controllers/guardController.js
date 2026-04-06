import Visitor from "../models/Visitor.js";
import EmergencyAlert from "../models/EmergencyAlert.js";
import Parcel from "../models/Parcel.js";
import Wing from "../models/wingModel.js";
import { notifyEmergencyToAdmins } from "../utils/emergencyNotifier.js";

const WING_ADMIN_ROLE = "wingadmin";
const toRole = (role) => String(role || "").toLowerCase();
const escapeRegex = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const isObjectIdString = (value = "") => /^[a-f\d]{24}$/i.test(String(value).trim());

const resolveWingLabel = async (societyId, wingValue) => {
  if (!wingValue) return null;
  const raw = String(wingValue).trim();

  if (isObjectIdString(raw)) {
    const wingDoc = await Wing.findOne({ _id: raw, societyId }).select("wing code");
    return wingDoc?.wing || wingDoc?.code || raw;
  }

  const wingDoc = await Wing.findOne({
    societyId,
    $or: [
      { wing: { $regex: new RegExp(`^${escapeRegex(raw)}$`, "i") } },
      { code: { $regex: new RegExp(`^${escapeRegex(raw)}$`, "i") } },
    ],
  }).select("wing code");

  return wingDoc?.wing || wingDoc?.code || raw;
};

const buildVisitorQuery = (req) => {
  const role = toRole(req.user.role);
  const query = { societyId: req.user.societyId };

  if (role === WING_ADMIN_ROLE && req.user.wing) {
    query.wingId = req.user.wing;
  }

  return query;
};

const isTodayEnabled = (value) => {
  if (value === undefined) return true;
  return String(value).toLowerCase() === "true";
};

const emitParcelUpdate = (req, parcel, event = "updated") => {
  if (!req.io || !parcel?.societyId) return;
  req.io.to(String(parcel.societyId)).emit("parcelUpdated", {
    event,
    parcelId: parcel._id,
    status: parcel.status,
    flatNo: parcel.flatNo,
    wing: parcel.wing,
    updatedAt: new Date().toISOString(),
  });
};

const emitEmergencyUpdate = (req, alert, event = "updated") => {
  if (!req.io || !alert?.societyId) return;
  req.io.to(String(alert.societyId)).emit("emergencyUpdated", {
    event,
    emergencyId: alert._id,
    flatNo: alert.flatNo,
    wing: alert.wing,
    status: alert.status,
    type: alert.type,
    updatedAt: new Date().toISOString(),
  });
};

export const getGuardVisitors = async (req, res) => {
  try {
    const { status, category, q, today } = req.query;
    const query = buildVisitorQuery(req);

    if (status) query.status = String(status).toLowerCase();

    if (isTodayEnabled(today)) {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      query.scheduledFor = { $gte: start, $lte: end };
    }

    const normalizedCategory = String(category || "").toLowerCase();
    if (normalizedCategory === "delivery") {
      query.purpose = { $regex: /^delivery$/i };
    } else if (normalizedCategory === "worker") {
      query.purpose = { $in: [/^worker$/i, /^service$/i] };
    } else if (normalizedCategory === "vehicle") {
      query.vehicleNumber = { $exists: true, $ne: null };
    }

    let visitors = await Visitor.find(query)
      .populate("residentId", "ownerName flatNo phone wing")
      .populate("wingId", "wing code")
      .sort({ createdAt: -1 });

    const search = String(q || "").trim().toLowerCase();
    if (search) {
      visitors = visitors.filter((item) => {
        const name = String(item.visitorName || "").toLowerCase();
        const phone = String(item.phone || "").toLowerCase();
        const flat = String(item.residentId?.flatNo || "").toLowerCase();
        const vehicle = String(item.vehicleNumber || "").toLowerCase();
        return (
          name.includes(search) ||
          phone.includes(search) ||
          flat.includes(search) ||
          vehicle.includes(search)
        );
      });
    }

    return res.status(200).json({ success: true, data: visitors });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createEmergencyAlert = async (req, res) => {
  try {
    const { type, wing, flatNo, details } = req.body;
    if (!flatNo) {
      return res.status(400).json({ success: false, message: "flatNo is required" });
    }

    const normalizedWing = await resolveWingLabel(req.user.societyId, wing);

    const alert = await EmergencyAlert.create({
      societyId: req.user.societyId,
      type: type || "Security",
      wing: normalizedWing,
      flatNo: String(flatNo).trim(),
      details: details ? String(details).trim() : null,
      createdBy: req.user._id,
      createdByRole: toRole(req.user.role),
    });

    let notifyResult = { sent: 0, failed: 0, reason: "Not attempted" };
    try {
      notifyResult = await notifyEmergencyToAdmins({
        societyId: req.user.societyId,
        type: alert.type,
        flatNo: alert.flatNo,
        wing: alert.wing,
        details: alert.details,
      });
    } catch (notifyErr) {
      notifyResult = {
        sent: 0,
        failed: 0,
        reason: notifyErr.message || "Notification failed",
      };
    }

    alert.notification = {
      attemptedAt: new Date(),
      sent: Number(notifyResult.sent || 0),
      failed: Number(notifyResult.failed || 0),
      reason: notifyResult.reason || null,
    };
    await alert.save();
    emitEmergencyUpdate(req, alert, "created");

    return res.status(201).json({
      success: true,
      data: alert,
      notification: notifyResult,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const listEmergencyAlerts = async (req, res) => {
  try {
    const { status, q } = req.query;
    const query = { societyId: req.user.societyId };
    if (status) query.status = String(status).toLowerCase();

    if (q) {
      const pattern = new RegExp(escapeRegex(String(q).trim()), "i");
      query.$or = [{ flatNo: pattern }, { wing: pattern }, { details: pattern }];
    }

    const alerts = await EmergencyAlert.find(query).sort({ createdAt: -1 });
    const rows = alerts.map((item) => item.toObject());

    const wingIds = [...new Set(rows.map((row) => row.wing).filter((value) => isObjectIdString(value)))];
    let wingMap = new Map();

    if (wingIds.length) {
      const wings = await Wing.find({
        _id: { $in: wingIds },
        societyId: req.user.societyId,
      }).select("_id wing code");
      wingMap = new Map(wings.map((w) => [String(w._id), w.wing || w.code || String(w._id)]));
    }

    const normalizedRows = rows.map((row) => ({
      ...row,
      wing: isObjectIdString(row.wing) ? wingMap.get(String(row.wing)) || row.wing : row.wing,
    }));

    return res.status(200).json({ success: true, data: normalizedRows });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const resolveEmergencyAlert = async (req, res) => {
  try {
    const alert = await EmergencyAlert.findOne({
      _id: req.params.id,
      societyId: req.user.societyId,
    });

    if (!alert) {
      return res.status(404).json({ success: false, message: "Alert not found" });
    }

    alert.status = "resolved";
    alert.resolvedAt = new Date();
    alert.resolvedBy = req.user._id;
    await alert.save();
    emitEmergencyUpdate(req, alert, "resolved");

    return res.status(200).json({ success: true, data: alert });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createParcel = async (req, res) => {
  try {
    const {
      courier,
      trackingId,
      wing,
      flatNo,
      recipientName,
      recipientPhone,
      notes,
    } = req.body;

    if (!courier || !flatNo) {
      return res
        .status(400)
        .json({ success: false, message: "courier and flatNo are required" });
    }

    const parcel = await Parcel.create({
      societyId: req.user.societyId,
      courier: String(courier).trim(),
      trackingId: trackingId ? String(trackingId).trim() : null,
      wing: wing ? String(wing).trim() : null,
      flatNo: String(flatNo).trim(),
      recipientName: recipientName ? String(recipientName).trim() : null,
      recipientPhone: recipientPhone ? String(recipientPhone).trim() : null,
      notes: notes ? String(notes).trim() : null,
      createdBy: req.user._id,
      createdByRole: toRole(req.user.role),
    });

    emitParcelUpdate(req, parcel, "created");

    return res.status(201).json({ success: true, data: parcel });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const listParcels = async (req, res) => {
  try {
    const { status, today, q } = req.query;
    const query = { societyId: req.user.societyId };

    if (status) query.status = String(status).toLowerCase();

    if (isTodayEnabled(today)) {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      query.receivedAt = { $gte: start, $lte: end };
    }

    if (q) {
      const pattern = new RegExp(escapeRegex(String(q).trim()), "i");
      query.$or = [
        { trackingId: pattern },
        { flatNo: pattern },
        { wing: pattern },
        { recipientName: pattern },
      ];
    }

    const parcels = await Parcel.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: parcels });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const markParcelCollected = async (req, res) => {
  try {
    const parcel = await Parcel.findOne({
      _id: req.params.id,
      societyId: req.user.societyId,
    });

    if (!parcel) {
      return res.status(404).json({ success: false, message: "Parcel not found" });
    }

    parcel.status = "collected";
    parcel.collectedAt = new Date();
    parcel.collectedBy = req.user._id;
    await parcel.save();
    emitParcelUpdate(req, parcel, "collected");

    return res.status(200).json({ success: true, data: parcel });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
