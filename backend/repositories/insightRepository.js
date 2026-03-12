const prisma = require("../config/prisma");

const createInsight = async (data) => {
  return prisma.insight.create({ data });
};

const getInsightsByProject = async (projectId) => {
  return prisma.insight.findMany({
    where: { projectId },
    include: { paper: true },
    orderBy: { createdAt: "desc" }
  });
};

const getInsightById = async (id) => {
  return prisma.insight.findUnique({
    where: { id },
    include: {
      paper: true,
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
  getInsightById,
  deleteInsight
};