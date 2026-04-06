import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";

import {
  addResident,
  getWingResidents,
  updateResident,
  deleteResident,
  restoreResident,
  uploadResidentDocuments,
  getResidentMaintenance,
} from "../../controllers/wingAdmin/residentController.js";
import { protect, allowRoles } from "../../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);
router.use(allowRoles("wingadmin"));

// Absolute path to uploads/residents
const uploadPath = path.join(process.cwd(), "uploads", "residents");

// Create folder if not exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ 
  storage, 
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype === "application/pdf"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only images and PDFs are allowed"));
    }
  },
 });

router.post("/", addResident);
router.get("/", getWingResidents);
router.put("/:id", updateResident);
router.delete("/:id", deleteResident);
router.put("/restore/:id", restoreResident);
router.post("/:id/documents", upload.array("documents"), uploadResidentDocuments);
router.get("/maintenance/:id", getResidentMaintenance);

export default router;