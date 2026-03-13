const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const uploadMiddleware = require("../middleware/uploadMiddleware");
const fileController = require("../controllers/fileController");

const router = express.Router();

// Upload a single file
router.post("/upload", authenticate, uploadMiddleware.single("file"), fileController.uploadFile);

// Get files for a specific entity
router.get("/entity/:entityType/:entityId", authenticate, fileController.getFilesByEntity);

// Download a file (must be before /:id)
router.get("/:id/download", authenticate, fileController.downloadFile);

// Get single file metadata
router.get("/:id", authenticate, fileController.getFileById);

// Delete a file
router.delete("/:id", authenticate, fileController.deleteFile);

module.exports = router;

