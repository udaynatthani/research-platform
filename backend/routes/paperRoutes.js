const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const router = express.Router();

const paperController = require("../controllers/paperController");

// Deletion Route
router.delete("/:id", authenticate, paperController.deletePaper);

// General Routes
router.get("/", authenticate, paperController.getPapers);
router.get("/search", authenticate, paperController.searchPapers);
router.get("/search-external", authenticate, paperController.searchExternal);
router.get("/:id", authenticate, paperController.getPaperById);

// Creation Routes
router.post("/", authenticate, paperController.createPaper);
router.post("/save-external", authenticate, paperController.saveExternal);

module.exports = router;