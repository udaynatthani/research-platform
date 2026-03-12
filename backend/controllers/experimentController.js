const experimentService = require("../services/experimentService");

const createExperiment = async (req, res) => {
  try {
    const experiment = await experimentService.createExperiment(req.body);
    res.status(201).json(experiment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getExperiments = async (req, res) => {
  try {
    const experiments = await experimentService.getExperiments(req.params.projectId);
    res.json(experiments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateExperiment = async (req, res) => {
  try {
    const experiment = await experimentService.updateExperiment(req.params.id, req.body);
    res.json(experiment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteExperiment = async (req, res) => {
  try {
    await experimentService.deleteExperiment(req.params.id);
    res.json({ message: "Experiment deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createIteration = async (req, res) => {
  try {
    const iteration = await experimentService.createIteration(req.body);
    res.json(iteration);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addResult = async (req, res) => {
  try {
    const result = await experimentService.addResult(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createExperiment,
  getExperiments,
  updateExperiment,
  deleteExperiment,
  createIteration,
  addResult
};