const referenceService = require("../services/referenceService");

const createReference = async (req, res) => {
  try {

    const reference = await referenceService.createReference(req.body);
    res.status(201).json(reference);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }
};

const getReferences = async (req, res) => {
  try {

    const references = await referenceService.getReferences();
    res.json(references);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }
};

module.exports = {
  createReference,
  getReferences
};