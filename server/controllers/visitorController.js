import crypto from "crypto";
import Visitor from "../models/Visitor.js";
import Resident from "../models/Resident.js";
import Wing from "../models/wingModel.js";
import { sendWhatsApp } from "../utils/whatsapp.js";
import { sendWhatsAppWebMessage } from "../utils/whatsappService.js";

const RESIDENT_ROLE = "resident";
const WING_ADMIN_ROLE = "wingadmin";
const GUARD_ROLE = "guard";
const SOCIETY_ROLE = "society";

const toRole = (role) => String(role || "").toLowerCase();
const escapeRegex = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildArrivalMessage = (visitor, residentName) => {
  const now = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
  return `Hello ${residentName}, your visitor ${visitor.visitorName} has arrived at the gate for ${visitor.purpose} at ${now}.`;
};

const buildEntryMessage = (visitor, residentName, flatNo = "") =>
  `Hello ${residentName}, visitor ${visitor.visitorName} has arrived at Gate for Flat ${flatNo}. Please approve or reject from Visitor Panel.`;

const emitVisitorUpdate = (req, visitor, event = "updated") => {
  if (!req.io || !visitor?.societyId) return;

  req.io.to(String(visitor.societyId)).emit("visitorUpdated", {
    event,
    visitorId: visitor._id,
    residentId: visitor.residentId,
    status: visitor.status,
    visitorName: visitor.visitorName,
    flatNo: visitor.residentId?.flatNo || null,
    updatedAt: new Date().toISOString(),
  });
};

const emitVisitorArrived = (req, visitor, resident) => {
  if (!req.io) return;

  req.io.to(String(visitor.societyId)).emit("visitorArrived", {
    visitorId: visitor._id,
    residentId: visitor.residentId,
    residentName: resident?.ownerName || "Resident",
    visitorName: visitor.visitorName,
    purpose: visitor.purpose,
    status: visitor.status,
    arrivedAt: visitor.arrivedAt,
  });
};

const notifyResidentOnArrival = async (req, visitor) => {
  const resident = await Resident.findById(visitor.residentId).select(
    "ownerName phone"
  );

  if (!resident) return;

  emitVisitorArrived(req, visitor, resident);
  if (!resident.phone) return;

  const message = buildArrivalMessage(visitor, resident.ownerName);
  try {
    await sendWhatsAppWebMessage(resident.phone, message);
  } catch (webErr) {
    console.error("Visitor arrival WhatsApp web failed:", webErr.message);
    try {
      await sendWhatsApp(resident.phone, message);
    } catch (cloudErr) {
      console.error("Visitor arrival WhatsApp cloud fallback failed:", cloudErr.message);
    }
  }
};

const notifyResidentOnEntry = async (visitor) => {
  const resident = await Resident.findById(visitor.residentId).select(
    "ownerName phone flatNo"
  );

  if (!resident?.phone) return;

  try {
    await sendWhatsAppWebMessage(
      resident.phone,
      buildEntryMessage(visitor, resident.ownerName || "Resident", resident.flatNo || "")
    );
  } catch (webErr) {
    console.error("Visitor entry WhatsApp web failed:", webErr.message);
    try {
      await sendWhatsApp(
        resident.phone,
        buildEntryMessage(visitor, resident.ownerName || "Resident", resident.flatNo || "")
      );
    } catch (cloudErr) {
      console.error("Visitor entry WhatsApp cloud fallback failed:", cloudErr.message);
    }
  }
};

const findWingIdFromInput = async (societyId, wingValue) => {
  if (!wingValue) return null;
  const normalized = String(wingValue).trim();

  const wing = await Wing.findOne({
    societyId,
    $or: [
      { code: { $regex: new RegExp(`^${escapeRegex(normalized)}$`, "i") } },
      { wing: { $regex: new RegExp(`^${escapeRegex(normalized)}$`, "i") } },
    ],
  }).select("_id");

  return wing?._id || null;
};

const getResidentForRequest = async (
  req,
  residentIdFromBody,
  flatNoFromBody,
  wingFromBody
) => {
  const role = toRole(req.user.role);

  if (role === RESIDENT_ROLE) {
    return Resident.findOne({
      _id: req.user._id,
      societyId: req.user.societyId,
      isDeleted: false,
    }).select("_id ownerName phone wing societyId flatNo");
  }

  if (residentIdFromBody) {
    const resident = await Resident.findOne({
      _id: residentIdFromBody,
      societyId: req.user.societyId,
      isDeleted: false,
    }).select("_id ownerName phone wing societyId flatNo");

    if (!resident) return null;

    if (
      role === WING_ADMIN_ROLE &&
      req.user.wing &&
      String(resident.wing) !== String(req.user.wing)
    ) {
      return null;
    }

    return resident;
  }

  if (!flatNoFromBody) return null;

  const residentQuery = {
    societyId: req.user.societyId,
    isDeleted: false,
    flatNo: {
      $regex: new RegExp(`^${escapeRegex(String(flatNoFromBody).trim())}$`, "i"),
    },
  };

  if (wingFromBody) {
    const wingId = await findWingIdFromInput(req.user.societyId, wingFromBody);
    if (!wingId) return null;
    residentQuery.wing = wingId;
  }

  if (role === WING_ADMIN_ROLE && req.user.wing) {
    residentQuery.wing = req.user.wing;
  }

  return Resident.findOne(residentQuery).select(
    "_id ownerName phone wing societyId flatNo"
  );
};

export const registerVisitor = async (req, res) => {
  try {
    const {
      visitorName,
      phone,
      purpose,
      scheduledFor,
      residentId,
      flatNo,
      wing,
      vehicleNumber,
      notes,
      deliveryPartner,
      photo,
    } = req.body;
    const role = toRole(req.user.role);

    if (!visitorName || !purpose) {
      return res.status(400).json({
        success: false,
        message: "visitorName and purpose are required",
      });
    }

    const resident = await getResidentForRequest(req, residentId, flatNo, wing);
    if (!resident) {
      return res.status(404).json({
        success: false,
        message: "Resident/Flat not found or not accessible",
      });
    }

    const autoApproved = role === RESIDENT_ROLE;
    const qrToken = crypto.randomBytes(16).toString("hex");
    const qrCodeData = `RGMS_VISITOR:${qrToken}`;
    const now = new Date();
    const entryTime = scheduledFor ? new Date(scheduledFor) : now;

    const visitor = await Visitor.create({
      societyId: req.user.societyId,
      wingId: resident.wing,
      residentId: resident._id,
      visitorName: String(visitorName).trim(),
      phone: phone ? String(phone).trim() : null,
      purpose: String(purpose).trim(),
      deliveryPartner: deliveryPartner ? String(deliveryPartner).trim() : null,
      photo: photo ? String(photo).trim() : null,
      scheduledFor: entryTime,
      vehicleNumber: vehicleNumber ? String(vehicleNumber).trim().toUpperCase() : null,
      notes: notes ? String(notes).trim() : null,
      qrToken,
      qrCodeData,
      status: autoApproved ? "approved" : "pending",
      createdBy: req.user._id,
      createdByRole: role,
      approvedBy: autoApproved ? req.user._id : null,
      approvedAt: autoApproved ? now : null,
      statusTimeline: [
        {
          status: autoApproved ? "approved" : "pending",
          changedAt: now,
          changedBy: req.user._id,
          actorRole: role,
          note: autoApproved
            ? "Auto-approved by resident registration"
            : "Visitor registered and awaiting resident approval",
        },
      ],
    });

    await visitor.populate("residentId", "ownerName flatNo phone wing");
    await visitor.populate("wingId", "wing code");

    emitVisitorUpdate(req, visitor, "created");

    if (!autoApproved) {
      await notifyResidentOnEntry(visitor);
    }

    return res.status(201).json({ success: true, data: visitor });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find({
      societyId: req.user.societyId,
      residentId: req.user._id,
    })
      .populate("residentId", "ownerName flatNo wing")
      .populate("wingId", "wing code")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: visitors });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyPendingApprovals = async (req, res) => {
  try {
    const visitors = await Visitor.find({
      societyId: req.user.societyId,
      residentId: req.user._id,
      status: "pending",
    })
      .populate("residentId", "ownerName flatNo wing")
      .populate("wingId", "wing code")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: visitors });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateVisitorApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!["approved", "rejected"].includes(String(status || "").toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "status must be approved or rejected",
      });
    }

    const visitor = await Visitor.findOne({
      _id: id,
      societyId: req.user.societyId,
      residentId: req.user._id,
    });

    if (!visitor) {
      return res
        .status(404)
        .json({ success: false, message: "Visitor request not found" });
    }

    if (["arrived", "exited"].includes(String(visitor.status || "").toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Arrival/exit already recorded; approval cannot be changed",
      });
    }

    const nextStatus = String(status).toLowerCase();
    visitor.status = nextStatus;
    visitor.approvalNote = note ? String(note).trim() : null;
    visitor.approvedBy = nextStatus === "approved" ? req.user._id : null;
    visitor.approvedAt = nextStatus === "approved" ? new Date() : null;
    visitor.statusTimeline.push({
      status: nextStatus,
      changedAt: new Date(),
      changedBy: req.user._id,
      actorRole: toRole(req.user.role),
      note: visitor.approvalNote,
    });

    await visitor.save();
    await visitor.populate("residentId", "ownerName flatNo phone wing");
    await visitor.populate("wingId", "wing code");
    emitVisitorUpdate(req, visitor, "resident_approval");

    return res.status(200).json({ success: true, data: visitor });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getVisitorsForGate = async (req, res) => {
  try {
    const { status, from, to, today } = req.query;
    const role = toRole(req.user.role);
    const query = { societyId: req.user.societyId };

    if (status) query.status = String(status).toLowerCase();
    if (role === WING_ADMIN_ROLE && req.user.wing) {
      query.wingId = req.user.wing;
    }

    if (String(today || "").toLowerCase() === "true") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      query.scheduledFor = { $gte: start, $lte: end };
    } else if (from || to) {
      query.scheduledFor = {};
      if (from) query.scheduledFor.$gte = new Date(from);
      if (to) query.scheduledFor.$lte = new Date(to);
    }

    const visitors = await Visitor.find(query)
      .populate("residentId", "ownerName flatNo phone wing")
      .populate("wingId", "wing code")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: visitors });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getVisitorByQr = async (req, res) => {
  try {
    const { token } = req.params;
    const role = toRole(req.user.role);

    const query = {
      societyId: req.user.societyId,
      qrToken: token,
    };
    if (role === WING_ADMIN_ROLE && req.user.wing) {
      query.wingId = req.user.wing;
    }

    const visitor = await Visitor.findOne(query)
      .populate("residentId", "ownerName flatNo phone wing")
      .populate("wingId", "wing code");

    if (!visitor) {
      return res
        .status(404)
        .json({ success: false, message: "Visitor QR not found" });
    }

    return res.status(200).json({ success: true, data: visitor });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const markVisitorArrived = async (req, res) => {
  try {
    const { visitorId, qrToken } = req.body;
    const role = toRole(req.user.role);

    if (!visitorId && !qrToken) {
      return res.status(400).json({
        success: false,
        message: "visitorId or qrToken is required",
      });
    }

    const query = { societyId: req.user.societyId };
    if (visitorId) query._id = visitorId;
    if (qrToken) query.qrToken = qrToken;
    if (role === WING_ADMIN_ROLE && req.user.wing) {
      query.wingId = req.user.wing;
    }

    const visitor = await Visitor.findOne(query)
      .populate("residentId", "ownerName flatNo phone wing")
      .populate("wingId", "wing code");

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor entry not found",
      });
    }

    if (visitor.status === "arrived") {
      return res.status(200).json({
        success: true,
        data: visitor,
        message: "Visitor arrival is already marked",
      });
    }

    if (visitor.status === "pending") {
      return res.status(400).json({
        success: false,
        message: "Visitor is pending resident approval",
      });
    }

    if (
      ["rejected", "cancelled", "exited"].includes(
        String(visitor.status || "").toLowerCase()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: `Entry is not allowed for status ${visitor.status}`,
      });
    }

    visitor.status = "arrived";
    visitor.arrivedAt = new Date();
    visitor.arrivedBy = req.user._id;
    visitor.statusTimeline.push({
      status: "arrived",
      changedAt: new Date(),
      changedBy: req.user._id,
      actorRole: role,
      note: "Visitor marked as arrived at gate",
    });

    await visitor.save();
    emitVisitorUpdate(req, visitor, "arrived");
    await notifyResidentOnArrival(req, visitor);

    return res.status(200).json({
      success: true,
      data: visitor,
      message: "Visitor arrival marked and resident notified",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const markVisitorExit = async (req, res) => {
  try {
    const { visitorId, qrToken } = req.body;
    const role = toRole(req.user.role);

    if (!visitorId && !qrToken) {
      return res.status(400).json({
        success: false,
        message: "visitorId or qrToken is required",
      });
    }

    const query = { societyId: req.user.societyId };
    if (visitorId) query._id = visitorId;
    if (qrToken) query.qrToken = qrToken;
    if (role === WING_ADMIN_ROLE && req.user.wing) {
      query.wingId = req.user.wing;
    }

    const visitor = await Visitor.findOne(query)
      .populate("residentId", "ownerName flatNo phone wing")
      .populate("wingId", "wing code");

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor entry not found",
      });
    }

    if (visitor.status === "exited") {
      return res.status(200).json({
        success: true,
        data: visitor,
        message: "Visitor exit is already marked",
      });
    }

    if (
      ["pending", "rejected", "cancelled"].includes(
        String(visitor.status || "").toLowerCase()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: `Exit cannot be marked for status ${visitor.status}`,
      });
    }

    visitor.status = "exited";
    visitor.exitedAt = new Date();
    visitor.exitedBy = req.user._id;
    visitor.statusTimeline.push({
      status: "exited",
      changedAt: new Date(),
      changedBy: req.user._id,
      actorRole: role,
      note: "Visitor exit marked at gate",
    });

    await visitor.save();
    emitVisitorUpdate(req, visitor, "exited");

    return res.status(200).json({
      success: true,
      data: visitor,
      message: "Visitor exit marked",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateGateApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const role = toRole(req.user.role);

    if (![WING_ADMIN_ROLE, SOCIETY_ROLE, GUARD_ROLE].includes(role)) {
      return res.status(403).json({
        success: false,
        message: "Only gate authorized roles can update gate approval",
      });
    }

    const nextStatus = String(status || "").toLowerCase();
    if (!["approved", "rejected"].includes(nextStatus)) {
      return res.status(400).json({
        success: false,
        message: "status must be approved or rejected",
      });
    }

    const query = {
      _id: id,
      societyId: req.user.societyId,
    };
    if (role === WING_ADMIN_ROLE && req.user.wing) {
      query.wingId = req.user.wing;
    }

    const visitor = await Visitor.findOne(query).populate(
      "residentId",
      "ownerName flatNo phone wing"
    );

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor request not found",
      });
    }

    if (["arrived", "exited", "cancelled"].includes(String(visitor.status || ""))) {
      return res.status(400).json({
        success: false,
        message: `Cannot change gate approval for status ${visitor.status}`,
      });
    }

    visitor.status = nextStatus;
    visitor.approvalNote = note ? String(note).trim() : null;
    visitor.approvedBy = nextStatus === "approved" ? req.user._id : null;
    visitor.approvedAt = nextStatus === "approved" ? new Date() : null;
    visitor.statusTimeline.push({
      status: nextStatus,
      changedAt: new Date(),
      changedBy: req.user._id,
      actorRole: role,
      note:
        visitor.approvalNote ||
        (nextStatus === "approved"
          ? "Approved at gate after verification"
          : "Rejected at gate due to security check"),
    });

    await visitor.save();
    emitVisitorUpdate(req, visitor, "gate_approval");

    return res.status(200).json({
      success: true,
      data: visitor,
      message:
        nextStatus === "approved"
          ? "Visitor approved at gate"
          : "Visitor rejected at gate",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
