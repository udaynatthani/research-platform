const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const router = express.Router();

const conceptController = require("../controllers/conceptController");

router.post("/", authenticate, conceptController.createConcept);
router.get("/:projectId", authenticate, conceptController.getConcepts);
router.post("/link", authenticate, conceptController.linkConcepts);

module.exports = router;