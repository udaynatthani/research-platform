const prisma = require("../config/prisma");

const createDataset = async (data) => {

  return prisma.dataset.create({
    data
  });

};

const getDatasets = async () => {

  return prisma.dataset.findMany();

};

module.exports = {
  createDataset,
  getDatasets
};