const prisma = require("../config/prisma");

const createExperiment = async (data) => {
  return prisma.experiment.create({ data });
};

const getExperimentsByProject = async (projectId) => {
  return prisma.experiment.findMany({
    where: { projectId },
    include: {
      iterations: {
        include: { results: true },
        orderBy: { iterationNumber: "asc" }
      }
    },
    orderBy: { createdAt: "desc" }
  });
};

const getExperimentById = async (id) => {
  return prisma.experiment.findUnique({
    where: { id },
    include: {
      iterations: {
        include: { results: true },
        orderBy: { iterationNumber: "asc" }
      }
    }
  });
};

const deleteExperiment = async (id) => {
  return prisma.experiment.delete({
    where: { id }
  });
};

const updateExperiment = async (id, data) => {
  return prisma.experiment.update({
    where: { id },
    data
  });
};

module.exports = {
  createExperiment,
  getExperimentsByProject,
  getExperimentById,
  deleteExperiment,
  updateExperiment
};