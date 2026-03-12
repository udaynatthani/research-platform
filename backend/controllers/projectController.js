const projectService = require("../services/projectService");

const createProject = async (req, res) => {
  try {

    const data = {
      ...req.body,
      ownerId: req.user.userId
    };

    const project = await projectService.createProject(
      req.body,
      req.user.userId
    );

    res.status(201).json(project);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }
};

const getProjects = async (req, res) => {

  try {

    const projects = await projectService.getProjects(req.user.userId);

    res.json(projects);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};

const getProject = async (req, res) => {

  const project = await projectService.getProjectById(req.params.id);

  res.json(project);

};

module.exports = {
  createProject,
  getProjects,
  getProject
};