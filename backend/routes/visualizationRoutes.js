const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const router = express.Router();

const visualizationController = require("../controllers/visualizationController");

router.get("/concept-graph/:projectId", authenticate, visualizationController.conceptGraph);
router.get("/workflow-timeline/:projectId", authenticate, visualizationController.workflowTimeline);
router.get("/insight-network/:projectId", authenticate, visualizationController.insightNetwork);

module.exports = router;