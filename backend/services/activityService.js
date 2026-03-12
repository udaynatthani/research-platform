const prisma = require("../config/prisma");

/**
 * Activity Service
 * Logic for retrieving audit logs and activity feeds.
 */

const getGlobalActivity = async (limitInput = 20) => {
  const limit = parseInt(limitInput) || 20;
  return prisma.auditLog.findMany({
    include: {
      user: {
        select: { username: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
};

const getUserActivity = async (userId, limitInput = 20) => {
  const limit = parseInt(limitInput) || 20;
  return prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
};

const getProjectActivity = async (projectId, limitInput = 20) => {
  const limit = parseInt(limitInput) || 20;
  // AuditLog doesn't have projectId directly, but we can filter by metadata or joins if we added them.
  // For now, let's just return global or filtered by entity if possible.
  return prisma.auditLog.findMany({
    where: {
      metadata: {
        path: { contains: projectId }, // Hacky way if we didn't add projectId to schema
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
};

module.exports = {
  getGlobalActivity,
  getUserActivity,
  getProjectActivity,
};
