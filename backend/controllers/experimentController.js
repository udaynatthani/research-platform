const experimentService = require("../services/experimentService");

const createExperiment = async (req, res) => {
  try {
    const experiment = await experimentService.createExperiment(req.body);
    res.status(201).json(experiment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getExperiments = async (req, res) => {
  try {
    const experiments = await experimentService.getExperiments();
    res.json(experiments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createExperiment,
  getExperiments
};