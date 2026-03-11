const prisma = require("../config/prisma");

const createStage = async (data) => {

  const { projectId, name, position } = data;

  return prisma.workflowStage.create({
    data: {
      projectId,
      name,
      position
    }
  });

};

const getStagesByProject = async (projectId) => {

  return prisma.workflowStage.findMany({
    where: { projectId },
    orderBy: { position: "asc" },
    include: {
      items: true
    }
  });

};

module.exports = {
  createStage,
  getStagesByProject
};