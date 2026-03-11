const prisma = require("../config/prisma");

const createInsight = async (data) => {

  const { projectId, content, paperId, conceptNodeId } = data;

  return prisma.insight.create({
    data: {
      projectId,
      content,
      paperId,
      conceptNodeId
    }
  });

};

const getInsightsByProject = async (projectId) => {

  return prisma.insight.findMany({
    where: { projectId },
    include: {
      paper: true
    }
  });

};

const getInsightLineage = async (id) => {

  return prisma.insight.findUnique({
    where: { id },
    include: {
      paper: true,
      project: true
    }
  });

};

module.exports = {
  createInsight,
  getInsightsByProject,
  getInsightLineage
};