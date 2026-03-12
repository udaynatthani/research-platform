const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const createUser = async (data) => {
  const { email, username, password } = data;

  if (!email || !username || !password) {
    throw new Error("email, username and password are required");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash
    }
  });

  return {
    id: user.id,
    email: user.email,
    username: user.username
  };
};

const loginUser = async (data) => {
  const { email, password } = data;

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) throw new Error("User not found");

  const valid = await bcrypt.compare(password, user.passwordHash);

  if (!valid) throw new Error("Invalid password");

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username
    }
  };
};

const getUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      username: true
    }
  });
};

module.exports = {
  createUser,
  loginUser,
  getUsers
};