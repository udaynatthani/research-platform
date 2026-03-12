const conceptService = require("../services/conceptService");

const createConcept = async (req, res) => {
  try {

    const concept = await conceptService.createConcept(req.body);
    res.status(201).json(concept);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }
};

const getConcepts = async (req, res) => {
  try {

    const concepts = await conceptService.getConceptsByProject(req.params.projectId);
    res.json(concepts);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }
};

const linkConcepts = async (req, res) => {
  try {

    const link = await conceptService.linkConcepts(req.body);
    res.status(201).json(link);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }
};

module.exports = {
  createConcept,
  getConcepts,
  linkConcepts
};