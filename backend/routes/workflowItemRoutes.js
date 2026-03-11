const express = require("express");

const router = express.Router();

const workflowItemController = require("../controllers/workflowItemController");

router.post("/", workflowItemController.createItem);
router.patch("/:id/status", workflowItemController.updateStatus);
router.patch("/:id/move", workflowItemController.moveStage);

module.exports = router;