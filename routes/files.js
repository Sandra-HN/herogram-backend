const express = require("express");
const multer = require("multer");
const path = require("path");
const { File } = require("../models"); // Sequelize File model
const authenticate = require("../middlewares/auth"); // Authentication middleware
const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const mimeType = file.mimetype.split("/")[0];

    if (mimeType === "image") {
      cb(null, "uploads/images"); // Store images in uploads/images
    } else if (mimeType === "video") {
      cb(null, "uploads/videos"); // Store videos in uploads/videos
    } else {
      return cb(new Error("Invalid file type"), false); // Reject unsupported files
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Authenticated file upload route
router.post(
  "/upload",
  authenticate,
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "No file provided or invalid file type/size" });
    }

    const { tags, metadata } = req.body;

    // Parse metadata if it exists and is a string
    let fileMetadata;
    try {
      fileMetadata = metadata ? JSON.parse(metadata) : {};
    } catch (error) {
      console.error("Error parsing metadata:", error);
      return res.status(400).json({ error: "Invalid metadata format" });
    }

    // Add file-related metadata
    fileMetadata.originalName = req.file.originalname;
    fileMetadata.mimeType = req.file.mimetype;
    fileMetadata.size = req.file.size;
    fileMetadata.uploadDate = new Date();

    try {
      // Convert tags to a comma-separated string
      const tagsString = Array.isArray(tags) ? tags.join(",") : tags;
      // Construct the shareable URL
      const shareableLink = `http://134.209.243.73/uploads/${req.file.path
        .replace(/\\/g, "/")
        .split("/")
        .slice(1)
        .join("/")}`;

      const file = await File.create({
        filename: req.file.filename,
        path: req.file.path,
        metadata: fileMetadata,
        tags: tagsString,
        views: 0,
        shareableLink: shareableLink,
        // createdBy: req.user.id,
      });

      res.status(201).json({ message: "File uploaded successfully", file });
    } catch (error) {
      console.error("Error during file creation:", error);
      res
        .status(500)
        .json({ error: "File upload failed", details: error.message });
    }
  }
);

// Authenticated route to get the list of all files
router.get("/", authenticate, async (req, res) => {
  try {
    const files = await File.findAll({
      // where: {
      //   createdBy: req.user.id, // Filter by the logged-in user's ID
      // },
      //attributes: ["id", "filename", "metadata", "tags", "views","path",], // Select relevant fields
    });
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve files" });
  }
});

// Authenticated route to get the statistics of a specific file by ID
router.get("/:id/stats", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const file = await File.findByPk(id, {
      attributes: ["id", "filename", "metadata", "views"], // Include metadata and views
    });
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }
    res.status(200).json(file);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve file statistics" });
  }
});

// Authenticated route to record a file view by ID
router.post("/:id/view", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const file = await File.findByPk(id);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // Increment the view count
    file.views += 1;
    await file.save();

    res.status(200).json({ message: "View recorded", views: file.views });
  } catch (error) {
    res.status(500).json({ error: "Failed to record view" });
  }
});

module.exports = router;
