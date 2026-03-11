const insightRepository = require("../repositories/insightRepository");

const createInsight = async (data) => {
  const { title, description, projectId } = data;

  if (!title) {
    throw new Error("Insight title is required");
  }

  return await insightRepository.createInsight(
    title,
    description,
    projectId
  );
};

const getInsights = async () => {
  return await insightRepository.getInsights();
};

module.exports = {
  createInsight,
  getInsights
};