const projectService = require("../services/projectService");

const createProject = async (req, res) => {
  try {
    const project = await projectService.createProject(req.body);
    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getProjects = async (req, res) => {
  try {
    const projects = await projectService.getProjects();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createProject,
  getProjects
};