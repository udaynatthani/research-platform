const prisma = require("../config/prisma");

const createReference = async (data) => {

  return prisma.reference.create({
    data
  });

};

const getReferences = async () => {

  return prisma.reference.findMany();

};

module.exports = {
  createReference,
  getReferences
};