const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const router = express.Router();

const workflowItemController = require("../controllers/workflowItemController");

router.post("/", authenticate, workflowItemController.createItem);
router.put("/:id", authenticate, workflowItemController.updateItem);
router.delete("/:id", authenticate, workflowItemController.deleteItem);
router.patch("/:id/status", authenticate, workflowItemController.updateStatus);
router.patch("/:id/move", authenticate, workflowItemController.moveStage);

module.exports = router;