import Event from "../models/Event.js";
import User from "../models/User.js";
import Resident from "../models/Resident.js";
import wingAdmin from "../models/wingAdminModel.js";
import Staff from "../models/Staff.js";

// Create Event
export const createEvent = async (req, res) => {
  try {
    const event = await Event.create(req.body);
    req.io.emit("eventCreated", event); // real-time update
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    console.error("Event creation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Events
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ eventDate: 1 });

    const attendeeIds = new Set();
    events.forEach((event) => {
      event.attendees.forEach((attendee) => {
        if (attendee.userId) attendeeIds.add(attendee.userId.toString());
      });
    });

    const ids = [...attendeeIds];
    const [users, residents, wingAdmins, staff] = await Promise.all([
      User.find({ _id: { $in: ids } }).select("name username email role"),
      Resident.find({ _id: { $in: ids } }).select("ownerName name email"),
      wingAdmin.find({ _id: { $in: ids } }).select("name username email"),
      Staff.find({ _id: { $in: ids } }).select("name role email"),
    ]);

    const nameMap = new Map();
    const addToMap = (doc, name) => {
      if (!doc?._id) return;
      nameMap.set(doc._id.toString(), name || "Unknown");
    };

    users.forEach((u) =>
      addToMap(u, u.name || u.username || u.email)
    );
    residents.forEach((r) =>
      addToMap(r, r.ownerName || r.name || r.email)
    );
    wingAdmins.forEach((w) =>
      addToMap(w, w.name || w.username || w.email)
    );
    staff.forEach((s) =>
      addToMap(s, s.name || s.email)
    );

    const enriched = events.map((event) => {
      const e = event.toObject();
      e.attendees = (e.attendees || []).map((att) => ({
        ...att,
        displayName: nameMap.get(att.userId?.toString()) || "",
      }));
      return e;
    });

    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// RSVP
export const rsvpEvent = async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.user.id;

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const existing = event.attendees.find(
      (a) => a.userId.toString() === userId
    );

    if (existing) {
      existing.status = status;
    } else {
      event.attendees.push({ userId, status });
    }

    await event.save();
    req.io.emit("rsvpUpdated", event);
    res.json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Attendance / QR check-in
export const checkInEvent = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const userId = req.user.id;
    const role = String(req.user.role || "").toLowerCase();
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (role === "guard") {
      const { userId: targetUserId, userIds, markAll, attendeeId } = req.body || {};

      if (markAll) {
        event.attendees.forEach((a) => {
          a.checkedIn = true;
          if (!a.status) a.status = "Going";
        });
        await event.save();
        req.io?.emit("attendanceUpdated", event);
        return res.json({ success: true, data: event });
      }

      if (attendeeId) {
        const attendee = event.attendees.id(attendeeId);
        if (!attendee) {
          return res.status(404).json({
            success: false,
            message: "Attendee not found",
          });
        }
        attendee.checkedIn = true;
        if (!attendee.status) attendee.status = "Going";
        await event.save();
        req.io?.emit("attendanceUpdated", event);
        return res.json({ success: true, data: event });
      }

      const ids = Array.isArray(userIds)
        ? userIds
        : targetUserId
          ? [targetUserId]
          : [];

      if (ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please provide userId/userIds or markAll",
        });
      }

      ids.forEach((id) => {
        const attendee = event.attendees.find(
          (a) => a.userId?.toString() === id.toString()
        );
        if (attendee) {
          attendee.checkedIn = true;
          if (!attendee.status) attendee.status = "Going";
        } else {
          event.attendees.push({
            userId: id,
            status: "Going",
            checkedIn: true,
          });
        }
      });

      await event.save();
      req.io?.emit("attendanceUpdated", event);
      return res.json({ success: true, data: event });
    }

    const attendee = event.attendees.find((a) => a.userId.toString() === userId);

    if (!attendee) {
      return res.status(400).json({ success: false, message: "User has not RSVP'd" });
    }

    attendee.checkedIn = true;
    await event.save();

    req.io?.emit("attendanceUpdated", event);
    res.json({ success: true, data: event });
  } catch (err) {
    console.error("Check-in error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// Update Event (drag/drop)
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    req.io.emit("eventUpdated", event);
    res.json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Event
export const deleteEvent = async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    req.io.emit("eventDeleted", req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
