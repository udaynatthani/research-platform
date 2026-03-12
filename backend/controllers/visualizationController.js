const visualizationService = require("../services/visualizationService");

const conceptGraph = async (req, res) => {
  try {

    const graph = await visualizationService.getConceptGraph(req.params.projectId);
    res.json(graph);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }
};

const workflowTimeline = async (req, res) => {
  try {

    const timeline = await visualizationService.getWorkflowTimeline(req.params.projectId);
    res.json(timeline);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }
};

const insightNetwork = async (req, res) => {
  try {

    const insights = await visualizationService.getInsightNetwork(req.params.projectId);
    res.json(insights);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }
};

module.exports = {
  conceptGraph,
  workflowTimeline,
  insightNetwork
};