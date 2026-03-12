const tagService = require("../services/tagService");

const getTags = async (req, res) => {
  try {
    const tags = await tagService.getTags();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const tagPaper = async (req, res) => {
  try {
    const { paperId, tagName } = req.body;
    const result = await tagService.tagPaper(paperId, tagName);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const untagPaper = async (req, res) => {
  try {
    const { paperId, tagId } = req.params;
    await tagService.untagPaper(paperId, tagId);
    res.json({ message: "Tag removed from paper" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getTags,
  tagPaper,
  untagPaper
};
