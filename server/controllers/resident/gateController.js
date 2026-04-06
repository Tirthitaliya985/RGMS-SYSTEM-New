import Visitor from "../../models/Visitor.js";
import Parcel from "../../models/Parcel.js";
import EmergencyAlert from "../../models/EmergencyAlert.js";
import Wing from "../../models/wingModel.js";
import { notifyEmergencyToAdmins } from "../../utils/emergencyNotifier.js";

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

const residentBase = (req) => ({
  societyId: req.user.societyId,
  residentId: req.user._id,
});

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

const normalizeFlatNo = (value = "") =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

export const getMyGateVisitors = async (req, res) => {
  try {
    const { status, category, q, today } = req.query;
    const query = { ...residentBase(req) };

    if (status) query.status = String(status).toLowerCase();

    if (String(today || "true").toLowerCase() === "true") {
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

    let rows = await Visitor.find(query)
      .populate("wingId", "wing code")
      .sort({ createdAt: -1 });

    const search = String(q || "").trim().toLowerCase();
    if (search) {
      rows = rows.filter((item) => {
        const name = String(item.visitorName || "").toLowerCase();
        const phone = String(item.phone || "").toLowerCase();
        const vehicle = String(item.vehicleNumber || "").toLowerCase();
        return (
          name.includes(search) || phone.includes(search) || vehicle.includes(search)
        );
      });
    }

    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyParcels = async (req, res) => {
  try {
    const { status, today, q } = req.query;
    const query = {
      societyId: req.user.societyId,
      flatNo: {
        $regex: new RegExp(`^${escapeRegex(String(req.user.flatNo || "").trim())}$`, "i"),
      },
    };

    if (status) query.status = String(status).toLowerCase();

    if (String(today || "true").toLowerCase() === "true") {
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
        { courier: pattern },
        { recipientName: pattern },
      ];
    }

    const rows = await Parcel.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const markMyParcelCollected = async (req, res) => {
  try {
    const parcel = await Parcel.findOne({
      _id: req.params.id,
      societyId: req.user.societyId,
      flatNo: {
        $regex: new RegExp(`^${escapeRegex(String(req.user.flatNo || "").trim())}$`, "i"),
      },
    });

    if (!parcel) {
      return res.status(404).json({ success: false, message: "Parcel not found" });
    }

    parcel.status = "collected";
    parcel.collectedAt = new Date();
    parcel.collectedBy = req.user._id;
    await parcel.save();
    emitParcelUpdate(req, parcel, "resident_collected");

    return res.status(200).json({ success: true, data: parcel });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyEmergencyAlerts = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { societyId: req.user.societyId };
    if (status) query.status = String(status).toLowerCase();

    const userFlat = normalizeFlatNo(req.user.flatNo || "");
    const rows = await EmergencyAlert.find(query).sort({ createdAt: -1 });
    const mappedRows = rows
      .map((item) => item.toObject())
      .filter((row) => normalizeFlatNo(row.flatNo || "") === userFlat);

    const wingIds = [...new Set(mappedRows.map((row) => row.wing).filter((value) => isObjectIdString(value)))];
    let wingMap = new Map();

    if (wingIds.length) {
      const wings = await Wing.find({
        _id: { $in: wingIds },
        societyId: req.user.societyId,
      }).select("_id wing code");
      wingMap = new Map(wings.map((w) => [String(w._id), w.wing || w.code || String(w._id)]));
    }

    const normalizedRows = mappedRows.map((row) => ({
      ...row,
      wing: isObjectIdString(row.wing) ? wingMap.get(String(row.wing)) || row.wing : row.wing,
    }));

    return res.status(200).json({ success: true, data: normalizedRows });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createMyEmergencyAlert = async (req, res) => {
  try {
    const { type, details } = req.body;
    const normalizedWing = await resolveWingLabel(req.user.societyId, req.user.wing);

    const alert = await EmergencyAlert.create({
      societyId: req.user.societyId,
      type: type || "Security",
      wing: normalizedWing,
      flatNo: String(req.user.flatNo || "").trim(),
      details: details ? String(details).trim() : null,
      createdBy: req.user._id,
      createdByRole: "resident",
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
