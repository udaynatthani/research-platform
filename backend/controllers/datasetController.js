const datasetService = require("../services/datasetService");

const createDataset = async (req, res) => {
  try {

    const dataset = await datasetService.createDataset(req.body);
    res.status(201).json(dataset);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }
};

const getDatasets = async (req, res) => {
  try {

    const datasets = await datasetService.getDatasets();
    res.json(datasets);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }
};

module.exports = {
  createDataset,
  getDatasets
};