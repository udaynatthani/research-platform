const insightService = require("../services/insightService");

const createInsight = async (req, res) => {
  try {
    const insight = await insightService.createInsight(req.body);
    res.status(201).json(insight);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getInsights = async (req, res) => {
  try {
    const insights = await insightService.getInsights();
    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createInsight,
  getInsights
};