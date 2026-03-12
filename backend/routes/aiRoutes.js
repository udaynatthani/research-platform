const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const router = express.Router();

const aiController = require("../controllers/aiController");

router.post("/summarize/:paperId", authenticate, aiController.summarizePaper);
router.post("/chat", authenticate, aiController.chatWithPaper);
router.post("/insights/:paperId", authenticate, aiController.extractInsights);
router.post("/plagiarism-check", authenticate, aiController.checkPlagiarism);
router.get("/recommendations/:paperId", authenticate, aiController.getRecommendations);
router.post("/index", authenticate, aiController.indexPaper);

module.exports = router;
