import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Set storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage });

// POST /api/upload
router.post("/", upload.single("photo"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded00" });

  const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

  res.json({ url });
});


export default router;
