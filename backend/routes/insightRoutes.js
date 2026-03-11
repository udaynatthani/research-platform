const express = require("express");

const router = express.Router();

const insightController = require("../controllers/insightController");

router.post("/", insightController.createInsight);

router.get("/project/:projectId", insightController.getInsights);

router.get("/lineage/:id", insightController.getLineage);

module.exports = router;