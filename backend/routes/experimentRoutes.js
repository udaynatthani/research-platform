const express = require("express");
const router = express.Router();

const experimentController = require("../controllers/experimentController");

router.post("/", experimentController.createExperiment);
router.get("/", experimentController.getExperiments);

module.exports = router;