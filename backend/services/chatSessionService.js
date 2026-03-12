const prisma = require("../config/prisma");

/**
 * Chat Session Service
 * Manages persistence of AI chat sessions and messages.
 */

const createSession = async (userId, paperId = null) => {
  return prisma.aIChatSession.create({
    data: {
      userId,
      paperId,
    },
  });
};

const getSessionsByUser = async (userId) => {
  return prisma.aIChatSession.findMany({
    where: { userId },
    include: {
      paper: {
        select: { title: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getSessionMessages = async (sessionId) => {
  return prisma.aIChatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });
};

const addMessage = async (sessionId, role, content) => {
  // Map roles to match ChatRole enum in Prisma schema
  const chatRole = role.toLowerCase() === "user" ? "USER" : "ASSISTANT";

  return prisma.aIChatMessage.create({
    data: {
      sessionId,
      role: chatRole,
      message: content, // Schema uses 'message', service used 'content'
    },
  });
};

module.exports = {
  createSession,
  getSessionsByUser,
  getSessionMessages,
  addMessage,
};
