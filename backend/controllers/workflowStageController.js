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

  const stages = await workflowStageService.getStagesByProject(req.params.projectId);

  res.json(stages);

};

module.exports = {
  createStage,
  getStages
};