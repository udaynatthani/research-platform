const prisma = require("../config/prisma");

/**
 * Insight Service
 * Logic for managing research insights and findings.
 */

const createInsight = async (data) => {
  const { projectId, content, paperId, conceptNodeId, experimentId, createdBy, confidenceScore } = data;

  return prisma.insight.create({
    data: {
      projectId,
      content,
      paperId: paperId || null,
      conceptNodeId: conceptNodeId || null,
      experimentId: experimentId || null,
      createdBy: createdBy || "USER",
      confidenceScore: confidenceScore || null
    }
  });
};

const getInsightsByProject = async (projectId) => {
  return prisma.insight.findMany({
    where: { projectId },
    include: {
      paper: true,
      experiment: true
    },
    orderBy: { createdAt: "desc" }
  });
};

const getInsightLineage = async (id) => {
  return prisma.insight.findUnique({
    where: { id },
    include: {
      paper: true,
      experiment: true,
      project: true
    }
  });
};

const deleteInsight = async (id) => {
  return prisma.insight.delete({
    where: { id }
  });
};

module.exports = {
  createInsight,
  getInsightsByProject,
  getInsightLineage,
  deleteInsight
};