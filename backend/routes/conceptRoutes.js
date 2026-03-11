const express = require("express");

const router = express.Router();

const conceptController = require("../controllers/conceptController");

router.post("/", conceptController.createConcept);

router.get("/:projectId", conceptController.getConcepts);

router.post("/link", conceptController.linkConcepts);

module.exports = router;