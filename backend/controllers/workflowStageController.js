const workflowStageService = require("../services/workflowStageService");

const createStage = async (req, res) => {
  try {
    const stage = await workflowStageService.createStage(req.body);
    res.status(201).json(stage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStages = async (req, res) => {
  try {
    const stages = await workflowStageService.getStagesByProject(req.params.projectId);
    res.json(stages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateStage = async (req, res) => {
  try {
    const stage = await workflowStageService.updateStage(req.params.id, req.body);
    res.json(stage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteStage = async (req, res) => {
  try {
    await workflowStageService.deleteStage(req.params.id);
    res.json({ message: "Stage deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const reorderStages = async (req, res) => {
  try {
    const { projectId, stageIds } = req.body;
    const result = await workflowStageService.reorderStages(projectId, stageIds);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createStage,
  getStages,
  updateStage,
  deleteStage,
  reorderStages
};