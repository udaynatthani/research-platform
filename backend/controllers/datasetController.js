const datasetService = require("../services/datasetService");

const createDataset = async (req, res) => {

  const dataset = await datasetService.createDataset(req.body);

  res.json(dataset);

};

const getDatasets = async (req, res) => {

  const datasets = await datasetService.getDatasets();

  res.json(datasets);

};

module.exports = {
  createDataset,
  getDatasets
};