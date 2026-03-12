const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const router = express.Router();

const insightController = require("../controllers/insightController");

router.post("/", authenticate, insightController.createInsight);
router.get("/project/:projectId", authenticate, insightController.getInsights);
router.get("/lineage/:id", authenticate, insightController.getLineage);
router.delete("/:id", authenticate, insightController.deleteInsight);

module.exports = router;