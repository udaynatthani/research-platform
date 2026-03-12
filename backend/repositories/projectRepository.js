const prisma = require("../config/prisma");

const createProject = async (data) => {
  return prisma.project.create({ data });
};

const getProjects = async () => {
  return prisma.project.findMany({
    include: { owner: { select: { id: true, username: true, email: true } } },
    orderBy: { createdAt: "desc" }
  });
};

const getProjectsByUser = async (userId) => {
  return prisma.project.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } }
      ]
    },
    include: { owner: { select: { id: true, username: true } } },
    orderBy: { createdAt: "desc" }
  });
};

const getProjectById = async (id) => {
  return prisma.project.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, username: true, email: true } },
      sections: { orderBy: { position: "asc" } },
      members: {
        include: { user: { select: { id: true, username: true, email: true } } }
      },
      datasets: true,
      references: true,
      workflows: { orderBy: { position: "asc" } }
    }
  });
};

const updateProject = async (id, data) => {
  return prisma.project.update({
    where: { id },
    data
  });
};

const deleteProject = async (id) => {
  return prisma.project.delete({
    where: { id }
  });
};

module.exports = {
  createProject,
  getProjects,
  getProjectsByUser,
  getProjectById,
  updateProject,
  deleteProject
};