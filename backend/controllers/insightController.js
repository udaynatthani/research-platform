const insightService = require("../services/insightService");

const createInsight = async (req, res) => {
  try {
    const insight = await insightService.createInsight(req.body);
    res.status(201).json(insight);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getInsights = async (req, res) => {
  try {
    const insights = await insightService.getInsightsByProject(req.params.projectId);
    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getLineage = async (req, res) => {
  try {
    const insight = await insightService.getInsightLineage(req.params.id);
    if (!insight) return res.status(404).json({ error: "Insight not found" });
    res.json(insight);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteInsight = async (req, res) => {
  try {
    await insightService.deleteInsight(req.params.id);
    res.json({ message: "Insight deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createInsight,
  getInsights,
  getLineage,
  deleteInsight
};