const express = require("express");

const router = express.Router();

const referenceController = require("../controllers/referenceController");

router.post("/", referenceController.createReference);
router.get("/", referenceController.getReferences);

module.exports = router;