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
  return prisma.$transaction(async (tx) => {
    // 1. Delete Results associated with iterations of this experiment
    const iterations = await tx.experimentIteration.findMany({
      where: { experimentId: id },
      select: { id: true }
    });
    const iterationIds = iterations.map(it => it.id);
    if (iterationIds.length > 0) {
      await tx.experimentResult.deleteMany({
        where: { experimentIterationId: { in: iterationIds } }
      });
    }
    
    // 2. Delete Iterations
    await tx.experimentIteration.deleteMany({ where: { experimentId: id } });
    
    // 3. Delete linked insights
    await tx.insight.deleteMany({ where: { experimentId: id } });
    
    // 4. Delete entity links
    await tx.entityLink.deleteMany({
      where: {
        OR: [
          { sourceType: 'EXPERIMENT', sourceId: id },
          { targetType: 'EXPERIMENT', targetId: id }
        ]
      }
    });

    // 5. Delete the experiment itself
    return tx.experiment.delete({ where: { id } });
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