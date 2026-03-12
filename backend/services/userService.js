const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * User Service
 * Handles user creation, authentication, and retrieval.
 */

const createUser = async (data) => {
  const { email, username, password } = data;

  // Additional check for existing user (though DB constraint handles this)
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { username }
      ]
    }
  });

  if (existingUser) {
    const field = existingUser.email === email ? "Email" : "Username";
    throw new Error(`${field} already exists`);
  }

  const passwordHash = await bcrypt.hash(password, 12); // Slightly higher rounds for security

  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
      role: "USER" // Default role
    }
  });

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role
  };
};

const loginUser = async (data) => {
  const { email, password } = data;

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error("Invalid email or password"); // Generic message for security
  }

  const valid = await bcrypt.compare(password, user.passwordHash);

  if (!valid) {
    throw new Error("Invalid email or password"); // Generic message for security
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" } // Shorter lifespan for tokens, usage of refresh tokens instead
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    }
  };
};

const getUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      createdAt: true
    }
  });
};

const getUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      createdAt: true
    }
  });
};

module.exports = {
  createUser,
  loginUser,
  getUsers,
  getUserById
};