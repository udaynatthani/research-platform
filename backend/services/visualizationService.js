const prisma = require("../config/prisma");

const getConceptGraph = async (projectId) => {

  const nodes = await prisma.conceptNode.findMany({
    where: { projectId }
  });

  const links = await prisma.conceptLink.findMany({
    where: {
      sourceNode: { projectId }
    },
    include: {
      sourceNode: true,
      targetNode: true
    }
  });

  return {
    nodes,
    links
  };

};

const getWorkflowTimeline = async (projectId) => {

  const stages = await prisma.workflowStage.findMany({
    where: { projectId },
    include: {
      items: true
    },
    orderBy: {
      position: "asc"
    }
  });

  return stages;

};

const getInsightNetwork = async (projectId) => {

  const insights = await prisma.insight.findMany({
    where: { projectId },
    include: {
      paper: true
    }
  });

  return insights;

};

module.exports = {
  getConceptGraph,
  getWorkflowTimeline,
  getInsightNetwork
};