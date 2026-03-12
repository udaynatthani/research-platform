const experimentRepository = require("../repositories/experimentRepository");

/**
 * Experiment Service
 * Logic for managing research experiments and iterations.
 */

const createExperiment = async (data) => {
  const { projectId, title, objective, methodology, status } = data;

  if (!projectId) throw new Error("projectId is required");
  if (!title) throw new Error("title is required");

  return experimentRepository.createExperiment({
    projectId,
    title,
    objective: objective || null,
    methodology: methodology || null,
    status: status || "TODO"
  });
};

const getExperiments = async (projectId) => {
  if (!projectId) throw new Error("projectId is required");
  return experimentRepository.getExperimentsByProject(projectId);
};

const updateExperiment = async (id, data) => {
  return experimentRepository.updateExperiment(id, data);
};

const deleteExperiment = async (id) => {
  return experimentRepository.deleteExperiment(id);
};

const createIteration = async (data) => {
  const { experimentId, iterationNumber, description } = data;
  if (!experimentId) throw new Error("experimentId is required");

  // Directly using prisma for sub-models that don't have repositories yet
  const prisma = require("../config/prisma");
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
  if (!experimentIterationId) throw new Error("experimentIterationId is required");

  const prisma = require("../config/prisma");
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
  updateExperiment,
  deleteExperiment,
  createIteration,
  addResult
};