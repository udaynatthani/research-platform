const prisma = require("../config/prisma");

const createPaper = async (data) => {
  return prisma.paper.create({ data });
};

const getPapers = async () => {
  return prisma.paper.findMany({
    include: {
      authors: {
        include: { author: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });
};

const getPaperById = async (id) => {
  return prisma.paper.findUnique({
    where: { id },
    include: {
      authors: {
        include: { author: true },
        orderBy: { authorOrder: "asc" }
      },
      tags: {
        include: { tag: true }
      },
      content: true,
      notes: true,
      insights: true
    }
  });
};

const searchPapers = async (query) => {
  return prisma.paper.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { abstract: { contains: query, mode: "insensitive" } }
      ]
    },
    include: {
      authors: {
        include: { author: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });
};

const deletePaper = async (id) => {
  return prisma.paper.delete({
    where: { id }
  });
};

module.exports = {
  createPaper,
  getPapers,
  getPaperById,
  searchPapers,
  deletePaper
};