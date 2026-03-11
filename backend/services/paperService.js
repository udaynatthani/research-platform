const prisma = require("../config/prisma");

const createPaper = async (data) => {

  return prisma.paper.create({
    data
  });

};

const getPapers = async () => {

  return prisma.paper.findMany({
    include: {
      authors: true,
      tags: true,
      notes: true
    }
  });

};

module.exports = {
  createPaper,
  getPapers
};