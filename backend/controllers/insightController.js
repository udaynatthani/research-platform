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

  const insights = await insightService.getInsightsByProject(req.params.projectId);

  res.json(insights);

};

const getLineage = async (req, res) => {

  const lineage = await insightService.getInsightLineage(req.params.id);

  res.json(lineage);

};

module.exports = {
  createInsight,
  getInsights,
  getLineage
};