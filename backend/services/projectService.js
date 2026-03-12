const prisma = require("../config/prisma");

const createProject = async (data, userId) => {

  const { title, description, visibility } = data;

  return prisma.project.create({
    data: {
      title,
      description,
      visibility,
      ownerId: userId
    }
  });

};

const getProjects = async (userId) => {

  return prisma.project.findMany({
    where: {
      ownerId: userId
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