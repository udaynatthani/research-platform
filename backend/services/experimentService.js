const prisma = require("../config/prisma");

const createExperiment = async (data) => {

  const { projectId, title, objective, methodology, status } = data;

  return prisma.experiment.create({
    data: {
      projectId,
      title,
      objective,
      methodology,
      status
    }
  });

};

const getExperiments = async (projectId) => {

  return prisma.experiment.findMany({
    where: { projectId },
    include: {
      iterations: {
        include: {
          results: true
        }
      }
    }
  });

};

const createIteration = async (data) => {

  const { experimentId, iterationNumber, description } = data;

  return prisma.experimentIteration.create({
    data: {
      experimentId,
      iterationNumber,
      description
    }
  });

};

const addResult = async (data) => {

  const { experimentIterationId, resultSummary, metrics } = data;

  return prisma.experimentResult.create({
    data: {
      experimentIterationId,
      resultSummary,
      metrics
    }
  });

};

module.exports = {
  createExperiment,
  getExperiments,
  createIteration,
  addResult
};