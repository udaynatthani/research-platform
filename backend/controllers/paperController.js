const paperService = require("../services/paperService");
const searchHistoryService = require("../services/searchHistoryService");

const createPaper = async (req, res) => {
  try {
    const paper = await paperService.createPaper(req.body);
    res.status(201).json(paper);
  } catch (error) {
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

const getPaperById = async (req, res) => {
  try {
    const paper = await paperService.getPaperById(req.params.id);
    if (!paper) {
      return res.status(404).json({ error: "Paper not found" });
    }
    res.json(paper);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const searchPapers = async (req, res) => {
  try {
    const { q, field, year } = req.query;
    const filters = { field, year };
    const results = await paperService.searchPapers(q || "", filters);
    
    // Record search history in background
    if (q && req.user) {
      searchHistoryService.recordSearch(req.user.userId, q, filters, results.length).catch(console.error);
    }
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const searchExternal = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }
    const results = await paperService.searchExternalPapers(q);

    // Record search history in background
    if (q && req.user) {
      searchHistoryService.recordSearch(req.user.userId, q, { external: true }, results.length).catch(console.error);
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const saveExternal = async (req, res) => {
  try {
    const paper = await paperService.savePaperFromExternal(req.body);
    res.status(201).json(paper);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deletePaper = async (req, res) => {
  try {
    await paperService.deletePaper(req.params.id);
    res.json({ message: "Paper deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPaper,
  getPapers,
  getPaperById,
  searchPapers,
  searchExternal,
  saveExternal,
  deletePaper
};