const fileService = require("../services/fileService");
const path = require("path");

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded or invalid file type" });
    }

    const { projectId, entityType, entityId, notes } = req.body;
    const userId = req.user.userId;

    // Additional size check based on your custom requirements if Multer didn't catch it
    // (Though Multer limits are already set, we can be more specific here)
    const sizeInMB = req.file.size / (1024 * 1024);
    const mimetype = req.file.mimetype;

    if (mimetype.startsWith('image/') && sizeInMB > 5) {
      return res.status(400).json({ error: "Image size exceeds 5MB limit" });
    }
    if (mimetype === 'application/pdf' && sizeInMB > 25) {
      return res.status(400).json({ error: "PDF size exceeds 25MB limit" });
    }

    const fileData = {
      uploadedById: userId,
      projectId: projectId || null,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      storagePath: req.file.path,
      entityType: entityType || "PROJECT", // Default to PROJECT if not specified
      entityId: entityId || null,
      metadata: {
        notes: notes || "",
        uploadDate: new Array().toString()
      }
    };

    const fileRecord = await fileService.createFileRecord(fileData);

    res.status(201).json({
      message: "File uploaded successfully",
      file: fileRecord
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getFilesByEntity = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const files = await fileService.getFilesByEntity(entityType, entityId);
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  uploadFile,
  getFilesByEntity
};
