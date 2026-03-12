const linkService = require("../services/linkService");

const createLink = async (req, res) => {
  try {
    const link = await linkService.createLink(req.body);
    res.status(201).json(link);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getLinks = async (req, res) => {
  try {
    const links = await linkService.getLinksByProject(req.params.projectId);
    res.json(links);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteLink = async (req, res) => {
  try {
    await linkService.deleteLink(req.params.id);
    res.json({ message: "Link deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createLink,
  getLinks,
  deleteLink
};