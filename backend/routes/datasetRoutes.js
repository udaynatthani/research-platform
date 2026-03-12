const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const router = express.Router();

const datasetController = require("../controllers/datasetController");

router.post("/", authenticate, datasetController.createDataset);
router.get("/", authenticate, datasetController.getDatasets);

module.exports = router;