const workflowItemService = require("../services/workflowItemService");

const createItem = async (req, res) => {
  try {
    const item = await workflowItemService.createWorkflowItem(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const item = await workflowItemService.updateItemStatus(req.params.id, req.body.status);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const moveStage = async (req, res) => {
  try {
    const item = await workflowItemService.moveItemToStage(req.params.id, req.body.stageId);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    await workflowItemService.deleteWorkflowItem(req.params.id);
    res.json({ message: "Workflow item deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateItem = async (req, res) => {
  try {
    const item = await workflowItemService.updateItem(req.params.id, req.body);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createItem,
  updateStatus,
  moveStage,
  deleteItem,
  updateItem
};