const visualizationService = require("../services/visualizationService");

const conceptGraph = async (req, res) => {

  const graph = await visualizationService.getConceptGraph(req.params.projectId);

  res.json(graph);

};

const workflowTimeline = async (req, res) => {

  const timeline = await visualizationService.getWorkflowTimeline(req.params.projectId);

  res.json(timeline);

};

const insightNetwork = async (req, res) => {

  const insights = await visualizationService.getInsightNetwork(req.params.projectId);

  res.json(insights);

};

module.exports = {
  conceptGraph,
  workflowTimeline,
  insightNetwork
};