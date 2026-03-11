const prisma = require("../config/prisma");

const createConcept = async (data) => {

  const { projectId, type, title, description } = data;

  return prisma.conceptNode.create({
    data: {
      projectId,
      type,
      title,
      description
    }
  });

};

const getConceptsByProject = async (projectId) => {

  return prisma.conceptNode.findMany({
    where: { projectId },
    include: {
      outgoing: true,
      incoming: true
    }
  });

};

const linkConcepts = async (data) => {

  const { sourceNodeId, targetNodeId, relationshipType } = data;

  return prisma.conceptLink.create({
    data: {
      sourceNodeId,
      targetNodeId,
      relationshipType
    }
  });

};

module.exports = {
  createConcept,
  getConceptsByProject,
  linkConcepts
};