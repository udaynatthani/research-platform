const express = require("express");

const router = express.Router();

const experimentController = require("../controllers/experimentController");

router.post("/", experimentController.createExperiment);

router.get("/:projectId", experimentController.getExperiments);

router.post("/iteration", experimentController.createIteration);

router.post("/result", experimentController.addResult);

module.exports = router;    