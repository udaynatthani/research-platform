const experimentRepository = require("../repositories/experimentRepository");

const createExperiment = async (data) => {
  const { objective, methodology, result, projectId } = data;

  if (!objective) {
    throw new Error("Experiment objective is required");
  }

  return await experimentRepository.createExperiment(
    objective,
    methodology,
    result,
    projectId
  );
};

const getExperiments = async () => {
  return await experimentRepository.getExperiments();
};

module.exports = {
  createExperiment,
  getExperiments
};