const express = require("express");

const router = express.Router();

const visualizationController = require("../controllers/visualizationController");

router.get("/concept-graph/:projectId", visualizationController.conceptGraph);

router.get("/workflow-timeline/:projectId", visualizationController.workflowTimeline);

router.get("/insight-network/:projectId", visualizationController.insightNetwork);

module.exports = router;