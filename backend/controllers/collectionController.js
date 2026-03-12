const collectionService = require("../services/collectionService");

const createCollection = async (req, res) => {
  try {
    const collection = await collectionService.createCollection(req.user.userId, req.body);
    res.status(201).json(collection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCollections = async (req, res) => {
  try {
    const collections = await collectionService.getCollections(req.user.userId);
    res.json(collections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCollection = async (req, res) => {
  try {
    const collection = await collectionService.getCollectionById(req.params.id, req.user.userId);
    if (!collection) return res.status(404).json({ error: "Collection not found" });
    res.json(collection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateCollection = async (req, res) => {
  try {
    const collection = await collectionService.updateCollection(req.params.id, req.user.userId, req.body);
    res.json(collection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteCollection = async (req, res) => {
  try {
    await collectionService.deleteCollection(req.params.id, req.user.userId);
    res.json({ message: "Collection deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addPaper = async (req, res) => {
  try {
    const { paperId } = req.body;
    const result = await collectionService.addPaperToCollection(req.params.id, paperId, req.user.userId);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const removePaper = async (req, res) => {
  try {
    const { paperId } = req.params;
    await collectionService.removePaperFromCollection(req.params.id, paperId, req.user.userId);
    res.json({ message: "Paper removed from collection" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createCollection,
  getCollections,
  getCollection,
  updateCollection,
  deleteCollection,
  addPaper,
  removePaper
};
