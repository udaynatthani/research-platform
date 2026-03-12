const prisma = require("../config/prisma");

const createExperiment = async (data) => {

  const { projectId, title, objective, methodology, status } = data;

  if (!projectId) {
    throw new Error("projectId is required");
  }

  if (!title) {
    throw new Error("title is required");
  }

  return prisma.experiment.create({
    data: {
      projectId,
      title,
      objective: objective || null,
      methodology: methodology || null,
      status: status || "TODO"
    }
  });

};

const getExperiments = async (projectId,userId) => {

  if (!projectId) {
    throw new Error("projectId is required");
  }

 
  return prisma.experiment.findMany({
    where: {
      projectId,
      project: {
        ownerId: userId
      }
    }
  });

};

const createIteration = async (data) => {

  const { experimentId, iterationNumber, description } = data;

  if (!experimentId) {
    throw new Error("experimentId is required");
  }

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

  if (!experimentIterationId) {
    throw new Error("experimentIterationId is required");
  }

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