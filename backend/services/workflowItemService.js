const prisma = require("../config/prisma");

/**
 * Workflow Item Service
 * Logic for managing individual tasks or artifacts within a stage.
 */

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
    data: { status }
  });
};

const moveItemToStage = async (id, stageId) => {
  return prisma.workflowItem.update({
    where: { id },
    data: { stageId }
  });
};

const deleteWorkflowItem = async (id) => {
  return prisma.workflowItem.delete({
    where: { id }
  });
};

const updateItem = async (id, data) => {
  const { title, description } = data;
  return prisma.workflowItem.update({
    where: { id },
    data: { title, description }
  });
};

module.exports = {
  createWorkflowItem,
  updateItemStatus,
  moveItemToStage,
  deleteWorkflowItem,
  updateItem
};