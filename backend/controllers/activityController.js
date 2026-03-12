const activityService = require("../services/activityService");

const getGlobalFeed = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const activity = await activityService.getGlobalActivity(limit);
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserFeed = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const activity = await activityService.getUserActivity(req.user.userId, limit);
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getGlobalFeed,
  getUserFeed,
};
