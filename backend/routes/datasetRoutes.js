const express = require("express");

const router = express.Router();

const datasetController = require("../controllers/datasetController");

router.post("/", datasetController.createDataset);
router.get("/", datasetController.getDatasets);

module.exports = router;