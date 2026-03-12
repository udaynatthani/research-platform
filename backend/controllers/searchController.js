const searchHistoryService = require("../services/searchHistoryService");

const getRecent = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const history = await searchHistoryService.getRecentSearches(req.user.userId, limit);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const clearHistory = async (req, res) => {
  try {
    await searchHistoryService.clearSearchHistory(req.user.userId);
    res.json({ message: "Search history cleared" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getRecent,
  clearHistory,
};
