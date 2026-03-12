const prisma = require("../config/prisma");
const crypto = require("crypto");

/**
 * Session Service
 * Manages refresh tokens for secure token rotation.
 */

const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex");
};

/**
 * Create a new session with a refresh token.
 */
const createSession = async (userId, req) => {

  const refreshToken = generateRefreshToken();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

  const session = await prisma.session.create({
    data: {
      userId,
      refreshToken,
      ipAddress: req.ip || null,
      userAgent: req.headers["user-agent"] || null,
      expiresAt
    }
  });

  return {
    sessionId: session.id,
    refreshToken: session.refreshToken
  };
};

/**
 * Validate and rotate a refresh token.
 * Returns a new refresh token (rotation) and userId.
 */
const refreshSession = async (refreshToken) => {

  const session = await prisma.session.findFirst({
    where: {
      refreshToken,
      revoked: false,
      expiresAt: { gt: new Date() }
    }
  });

  if (!session) {
    throw new Error("Invalid or expired refresh token");
  }

  // Revoke old token (rotation)
  await prisma.session.update({
    where: { id: session.id },
    data: { revoked: true }
  });

  // Create new session with fresh token
  const newRefreshToken = generateRefreshToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const newSession = await prisma.session.create({
    data: {
      userId: session.userId,
      refreshToken: newRefreshToken,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      expiresAt
    }
  });

  return {
    userId: session.userId,
    sessionId: newSession.id,
    refreshToken: newRefreshToken
  };
};

/**
 * Revoke a specific session (logout).
 */
const revokeSession = async (refreshToken) => {

  const session = await prisma.session.findFirst({
    where: { refreshToken }
  });

  if (!session) {
    throw new Error("Session not found");
  }

  await prisma.session.update({
    where: { id: session.id },
    data: { revoked: true }
  });

  return { message: "Session revoked" };
};

/**
 * Revoke all sessions for a user (logout everywhere).
 */
const revokeAllSessions = async (userId) => {

  await prisma.session.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true }
  });

  return { message: "All sessions revoked" };
};

/**
 * Get all active sessions for a user.
 */
const getActiveSessions = async (userId) => {

  return prisma.session.findMany({
    where: {
      userId,
      revoked: false,
      expiresAt: { gt: new Date() }
    },
    select: {
      id: true,
      ipAddress: true,
      userAgent: true,
      createdAt: true,
      expiresAt: true
    },
    orderBy: { createdAt: "desc" }
  });
};

module.exports = {
  createSession,
  refreshSession,
  revokeSession,
  revokeAllSessions,
  getActiveSessions
};
