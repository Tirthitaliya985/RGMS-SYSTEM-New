const express = require("express");
const router = express.Router();
const {
  getAllAdminComplaints,
  createAdminComplaint,
  replyToComplaint,
  deleteComplaint,
} = require("../controllers/adminComplaintController");

// Auth middleware
const verifyToken = require("../middleware/verifyToken");

router.use(verifyToken);

router.get("/", getAllAdminComplaints);
router.post("/", createAdminComplaint);
router.put("/:id/reply", replyToComplaint);
router.delete("/:id", deleteComplaint);

module.exports = router;
