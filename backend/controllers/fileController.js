const fileService = require("../services/fileService");
const path = require("path");
const fs = require("fs");

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded or invalid file type" });
    }

    const { projectId, entityType, entityId, notes } = req.body;
    const userId = req.user.userId;

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
      url: `/${req.file.path.replace(/\\/g, '/')}`,
      entityType: entityType || "PROJECT",
      entityId: entityId || null,
      metadata: {
        notes: notes || "",
        uploadDate: new Date().toISOString()
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

const getFileById = async (req, res) => {
  try {
    const file = await fileService.getFileById(req.params.id);
    if (!file) return res.status(404).json({ error: "File not found" });
    res.json(file);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const downloadFile = async (req, res) => {
  try {
    const file = await fileService.getFileById(req.params.id);
    if (!file) return res.status(404).json({ error: "File not found" });
    
    const filePath = path.resolve(file.storagePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Physical file not found" });
    }
    res.download(filePath, file.originalName);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteFile = async (req, res) => {
  try {
    const file = await fileService.getFileById(req.params.id);
    if (!file) return res.status(404).json({ error: "File not found" });
    
    // Delete physical file
    const filePath = path.resolve(file.storagePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    await fileService.deleteFileRecord(req.params.id);
    res.json({ message: "File deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  uploadFile,
  getFilesByEntity,
  getFileById,
  downloadFile,
  deleteFile
};

