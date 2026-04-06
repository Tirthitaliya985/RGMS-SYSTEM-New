import mongoose from "mongoose";

const EVENT_STATUSES = new Set(["Going", "Maybe", "Declined"]);

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
const maxLen = (value, n) => typeof value === "string" && value.length <= n;

const parseDate = (value) => {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const validateNotPastDate = (date) => {
  const allowPast = String(process.env.EVENT_ALLOW_PAST_DATES || "").toLowerCase() === "true";
  if (allowPast) return true;

  const graceMinutes = Number(process.env.EVENT_PAST_GRACE_MINUTES || 0);
  const graceMs = Number.isFinite(graceMinutes) && graceMinutes > 0 ? graceMinutes * 60 * 1000 : 0;

  return date.getTime() >= Date.now() - graceMs;
};

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value || ""));

const pickEventFields = (body = {}) => {
  const out = {};
  if (Object.prototype.hasOwnProperty.call(body, "title")) out.title = body.title;
  if (Object.prototype.hasOwnProperty.call(body, "description")) out.description = body.description;
  if (Object.prototype.hasOwnProperty.call(body, "eventDate")) out.eventDate = body.eventDate;
  if (Object.prototype.hasOwnProperty.call(body, "location")) out.location = body.location;
  if (Object.prototype.hasOwnProperty.call(body, "color")) out.color = body.color;
  return out;
};

export const validateEventIdParam = (req, res, next) => {
  const { id } = req.params || {};
  if (!isObjectId(id)) {
    return res.status(400).json({ success: false, message: "Invalid event id" });
  }
  return next();
};

export const validateCreateEvent = (req, res, next) => {
  const payload = pickEventFields(req.body || {});

  if (!isNonEmptyString(payload.title)) {
    return res.status(400).json({ success: false, message: "title is required" });
  }
  payload.title = payload.title.trim();
  if (!maxLen(payload.title, 120)) {
    return res.status(400).json({ success: false, message: "title is too long" });
  }

  const eventDate = parseDate(payload.eventDate);
  if (!eventDate) {
    return res.status(400).json({ success: false, message: "eventDate is required" });
  }
  if (!validateNotPastDate(eventDate)) {
    return res.status(400).json({ success: false, message: "eventDate cannot be in the past" });
  }
  payload.eventDate = eventDate;

  if (payload.description != null) {
    payload.description = String(payload.description);
    if (!maxLen(payload.description, 2000)) {
      return res.status(400).json({ success: false, message: "description is too long" });
    }
  }

  if (payload.location != null) {
    payload.location = String(payload.location).trim();
    if (payload.location && !maxLen(payload.location, 200)) {
      return res.status(400).json({ success: false, message: "location is too long" });
    }
  }

  if (payload.color != null) {
    payload.color = String(payload.color).trim();
    if (payload.color && !/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(payload.color)) {
      return res.status(400).json({ success: false, message: "color must be a hex value like #FFAA00" });
    }
  }

  req.body = payload;
  return next();
};

export const validateUpdateEvent = (req, res, next) => {
  const payload = pickEventFields(req.body || {});

  if (Object.keys(payload).length === 0) {
    return res.status(400).json({ success: false, message: "No updatable fields provided" });
  }

  if (payload.title != null) {
    if (!isNonEmptyString(payload.title)) {
      return res.status(400).json({ success: false, message: "title cannot be empty" });
    }
    payload.title = payload.title.trim();
    if (!maxLen(payload.title, 120)) {
      return res.status(400).json({ success: false, message: "title is too long" });
    }
  }

  if (payload.eventDate != null) {
    const eventDate = parseDate(payload.eventDate);
    if (!eventDate) {
      return res.status(400).json({ success: false, message: "eventDate is invalid" });
    }
    if (!validateNotPastDate(eventDate)) {
      return res.status(400).json({ success: false, message: "eventDate cannot be in the past" });
    }
    payload.eventDate = eventDate;
  }

  if (payload.description != null) {
    payload.description = String(payload.description);
    if (!maxLen(payload.description, 2000)) {
      return res.status(400).json({ success: false, message: "description is too long" });
    }
  }

  if (payload.location != null) {
    payload.location = String(payload.location).trim();
    if (payload.location && !maxLen(payload.location, 200)) {
      return res.status(400).json({ success: false, message: "location is too long" });
    }
  }

  if (payload.color != null) {
    payload.color = String(payload.color).trim();
    if (payload.color && !/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(payload.color)) {
      return res.status(400).json({ success: false, message: "color must be a hex value like #FFAA00" });
    }
  }

  req.body = payload;
  return next();
};

export const validateRsvp = (req, res, next) => {
  const { status } = req.body || {};
  if (!isNonEmptyString(status) || !EVENT_STATUSES.has(status.trim())) {
    return res.status(400).json({
      success: false,
      message: "status must be one of: Going, Maybe, Declined",
    });
  }

  req.body = { status: status.trim() };
  return next();
};

export const validateCheckInBody = (req, res, next) => {
  const body = req.body || {};
  const role = String(req.user?.role || "").toLowerCase();

  if (role !== "guard") return next();

  const markAll = Boolean(body.markAll);
  const attendeeId = body.attendeeId;
  const targetUserId = body.userId;
  const userIds = Array.isArray(body.userIds) ? body.userIds : null;

  if (!markAll && !attendeeId && !targetUserId && (!userIds || userIds.length === 0)) {
    return res.status(400).json({
      success: false,
      message: "Provide markAll, attendeeId, userId, or userIds",
    });
  }

  if (attendeeId && !isObjectId(attendeeId)) {
    return res.status(400).json({ success: false, message: "Invalid attendeeId" });
  }

  if (targetUserId && !isObjectId(targetUserId)) {
    return res.status(400).json({ success: false, message: "Invalid userId" });
  }

  if (userIds) {
    const invalid = userIds.find((id) => !isObjectId(id));
    if (invalid) {
      return res.status(400).json({ success: false, message: "Invalid userIds" });
    }
  }

  return next();
};
