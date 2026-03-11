const prisma = require("../config/prisma");

const createWorkflowItem = async (data) => {

  const {
    stageId,
    projectId,
    title,
    description,
    entityType,
    entityId
  } = data;

  return prisma.workflowItem.create({
    data: {
      stageId,
      projectId,
      title,
      description,
      entityType,
      entityId
    }
  });

};

const updateItemStatus = async (id, status) => {

  return prisma.workflowItem.update({
    where: { id },
    data: {
      status
    }
  });

};

const moveItemToStage = async (id, stageId) => {

  return prisma.workflowItem.update({
    where: { id },
    data: {
      stageId
    }
  });

};

module.exports = {
  createWorkflowItem,
  updateItemStatus,
  moveItemToStage
};