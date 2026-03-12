const prisma = require("../config/prisma");

/**
 * Generic Entity Link Service
 * Supports polymorphic linking between any two entities (Papers, Experiments, etc.)
 */

const createLink = async (data) => {
  const { projectId, sourceType, sourceId, targetType, targetId, relationshipType, description } = data || {};

  const missing = [];
  if (!projectId) missing.push("projectId");
  if (!sourceType) missing.push("sourceType");
  if (!sourceId) missing.push("sourceId");
  if (!targetType) missing.push("targetType");
  if (!targetId) missing.push("targetId");
  if (!relationshipType) missing.push("relationshipType");

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }

  return prisma.entityLink.create({
    data: {
      projectId,
      sourceType,
      sourceId,
      targetType,
      targetId,
      relationshipType,
      description: description || null
    }
  });
};

const getLinksByProject = async (projectId) => {
  if (!projectId) {
    throw new Error("projectId is required");
  }

  return prisma.entityLink.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" }
  });
};

const deleteLink = async (id) => {
  return prisma.entityLink.delete({
    where: { id }
  });
};

module.exports = {
  createLink,
  getLinksByProject,
  deleteLink
};