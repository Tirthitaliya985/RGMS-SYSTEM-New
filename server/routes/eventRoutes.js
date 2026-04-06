import express from "express";
import * as eventController from "../controllers/eventController.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";
import {
  validateEventIdParam,
  validateCreateEvent,
  validateUpdateEvent,
  validateRsvp,
  validateCheckInBody,
} from "../middleware/eventValidation.js";

const router = express.Router();

// CRUD operations (only Admins / Managers)
router.post("/", protect, allowRoles("Admin", "society"), validateCreateEvent, eventController.createEvent);
router.get("/", protect, eventController.getEvents);
router.put("/:id", protect, allowRoles("Admin", "society"), validateEventIdParam, validateUpdateEvent, eventController.updateEvent);
router.delete("/:id", protect, allowRoles("Admin", "society"), validateEventIdParam, eventController.deleteEvent);

// RSVP & Attendance (All residents)
router.put("/rsvp/:id", protect, validateEventIdParam, validateRsvp, eventController.rsvpEvent);
router.put("/attendance/:id", protect, validateEventIdParam, validateCheckInBody, eventController.checkInEvent);

export default router;
