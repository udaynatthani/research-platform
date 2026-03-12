const prisma = require("../config/prisma");

/**
 * Workflow Stage Service
 * Logic for managing phases of a research workflow.
 */

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
      items: {
        orderBy: { createdAt: "asc" }
      }
    }
  });
};

const updateStage = async (id, data) => {
  const { name, position } = data;
  return prisma.workflowStage.update({
    where: { id },
    data: { name, position }
  });
};

const deleteStage = async (id) => {
  // Items will be deleted/orphaned based on DB constraints
  // In our schema WorkflowItem has stageId which is usually non-nullable
  return prisma.workflowStage.delete({
    where: { id }
  });
};

const reorderStages = async (projectId, stageIds) => {
  // stageIds is an array of IDs in the desired order
  return prisma.$transaction(
    stageIds.map((id, index) =>
      prisma.workflowStage.update({
        where: { id, projectId },
        data: { position: index }
      })
    )
  );
};

module.exports = {
  createStage,
  getStagesByProject,
  updateStage,
  deleteStage,
  reorderStages
};