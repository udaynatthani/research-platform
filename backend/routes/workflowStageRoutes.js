const express = require("express");

const router = express.Router();

const workflowStageController = require("../controllers/workflowStageController");

router.post("/", workflowStageController.createStage);
router.get("/:projectId", workflowStageController.getStages);

module.exports = router;