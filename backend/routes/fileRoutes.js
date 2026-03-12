const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const uploadMiddleware = require("../middleware/uploadMiddleware");
const fileController = require("../controllers/fileController");

const router = express.Router();

// Upload a single file
// Expected body: projectId, entityType, entityId (optional)
// Expected file field: "file"
router.post("/upload", authenticate, uploadMiddleware.single("file"), fileController.uploadFile);

// Get files for a specific entity
router.get("/entity/:entityType/:entityId", authenticate, fileController.getFilesByEntity);

module.exports = router;
