const paperRepository = require("../repositories/paperRepository");

const createPaper = async (data) => {
  const { title, summary, projectId } = data;

  if (!title) {
    throw new Error("Paper title is required");
  }

  return await paperRepository.createPaper(title, summary, projectId);
};

const getPapers = async () => {
  return await paperRepository.getPapers();
};

module.exports = {
  createPaper,
  getPapers
};