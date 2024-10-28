const express = require("express");
const multer = require("multer");
const path = require("path");
const File = require("../models/File");
const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// File upload route
router.post("/upload", upload.single("file"), async (req, res) => {
  const { tags } = req.body;
  const file = new File({
    filename: req.file.filename,
    path: req.file.path,
    tags: tags.split(","),
  });
  await file.save();
  res.status(201).json({ message: "File uploaded successfully", file });
});

module.exports = router;
