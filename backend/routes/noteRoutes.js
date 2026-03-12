const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const router = express.Router();

const noteController = require("../controllers/noteController");

router.post("/", authenticate, noteController.createNote);
router.get("/paper/:paperId", authenticate, noteController.getNotes);
router.put("/:id", authenticate, noteController.updateNote);
router.delete("/:id", authenticate, noteController.deleteNote);

module.exports = router;
