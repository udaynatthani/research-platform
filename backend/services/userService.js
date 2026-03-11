const prisma = require("../config/prisma");

const createUser = async (data) => {
  const { email, username, passwordHash } = data;

  return prisma.user.create({
    data: {
      email,
      username,
      passwordHash
    }
  });
};

const getUsers = async () => {
  return prisma.user.findMany();
};

module.exports = {
  createUser,
  getUsers
};