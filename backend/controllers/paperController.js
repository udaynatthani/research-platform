const paperService = require("../services/paperService");

const createPaper = async (req, res) => {
  try {
    const paper = await paperService.createPaper(req.body);
    res.status(201).json(paper);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getPapers = async (req, res) => {
  try {
    const papers = await paperService.getPapers();
    res.json(papers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPaper,
  getPapers
};