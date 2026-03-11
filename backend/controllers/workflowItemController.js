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

  const item = await workflowItemService.updateItemStatus(
    req.params.id,
    req.body.status
  );

  res.json(item);

};

const moveStage = async (req, res) => {

  const item = await workflowItemService.moveItemToStage(
    req.params.id,
    req.body.stageId
  );

  res.json(item);

};

module.exports = {
  createItem,
  updateStatus,
  moveStage
};