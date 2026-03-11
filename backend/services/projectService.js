const prisma = require("../config/prisma");

const createProject = async (data) => {

  const { ownerId, title, description } = data;

  return prisma.project.create({
    data: {
      ownerId,
      title,
      description
    }
  });

};

const getProjects = async () => {

  return prisma.project.findMany({
    include: {
      owner: true
    }
  });

};

const getProjectById = async (id) => {

  return prisma.project.findUnique({
    where: { id },
    include: {
      sections: true,
      datasets: true,
      references: true
    }
  });

};

module.exports = {
  createProject,
  getProjects,
  getProjectById
};