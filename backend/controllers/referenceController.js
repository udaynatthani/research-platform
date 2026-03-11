const referenceService = require("../services/referenceService");

const createReference = async (req, res) => {

  const reference = await referenceService.createReference(req.body);

  res.json(reference);

};

const getReferences = async (req, res) => {

  const references = await referenceService.getReferences();

  res.json(references);

};

module.exports = {
  createReference,
  getReferences
};