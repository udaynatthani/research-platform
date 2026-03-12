const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const router = express.Router();

const tagController = require("../controllers/tagController");

router.get("/", authenticate, tagController.getTags);
router.post("/", authenticate, tagController.tagPaper);
router.delete("/:paperId/:tagId", authenticate, tagController.untagPaper);

module.exports = router;
