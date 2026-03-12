const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const router = express.Router();

const workflowStageController = require("../controllers/workflowStageController");

router.post("/", authenticate, workflowStageController.createStage);
router.get("/:projectId", authenticate, workflowStageController.getStages);
router.put("/:id", authenticate, workflowStageController.updateStage);
router.delete("/:id", authenticate, workflowStageController.deleteStage);
router.post("/reorder", authenticate, workflowStageController.reorderStages);

module.exports = router;