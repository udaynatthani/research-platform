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

  const experiments = await experimentService.getExperiments(req.params.projectId);

  res.json(experiments);

};

const createIteration = async (req, res) => {

  const iteration = await experimentService.createIteration(req.body);

  res.json(iteration);

};

const addResult = async (req, res) => {

  const result = await experimentService.addResult(req.body);

  res.json(result);

};

module.exports = {
  createExperiment,
  getExperiments,
  createIteration,
  addResult
};