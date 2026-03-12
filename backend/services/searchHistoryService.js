const prisma = require("../config/prisma");

/**
 * Search History Service
 * Logic for recording and retrieving user search queries.
 */

const recordSearch = async (userId, query, filters = {}, resultCount = 0) => {
  if (!query) return null;

  return prisma.searchHistory.create({
    data: {
      userId,
      query,
      filters,
      resultCount,
    },
  });
};

const getRecentSearches = async (userId, limitInput = 10) => {
  const limit = parseInt(limitInput) || 10;
  return prisma.searchHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
};

const clearSearchHistory = async (userId) => {
  return prisma.searchHistory.deleteMany({
    where: { userId },
  });
};

module.exports = {
  recordSearch,
  getRecentSearches,
  clearSearchHistory,
};
