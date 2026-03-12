const prisma = require("../config/prisma");

const createPaper = async (data) => {

  const {
    title,
    abstract,
    publicationYear,
    doi,
    url,
    source,
    externalId
  } = data;

  return prisma.paper.create({
    data: {
      title,
      abstract,
      publicationYear,
      doi,
      url,
      source,
      externalId
    }
  });

};

const getPapers = async () => {
  return prisma.paper.findMany();
};

module.exports = {
  createPaper,
  getPapers
};