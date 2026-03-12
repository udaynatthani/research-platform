const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const router = express.Router();

const experimentController = require("../controllers/experimentController");

router.post("/", authenticate, experimentController.createExperiment);
router.get("/:projectId", authenticate, experimentController.getExperiments);
router.put("/:id", authenticate, experimentController.updateExperiment);
router.delete("/:id", authenticate, experimentController.deleteExperiment);

router.post("/iteration", authenticate, experimentController.createIteration);
router.post("/result", authenticate, experimentController.addResult);

module.exports = router;    