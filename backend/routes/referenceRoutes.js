const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const router = express.Router();

const referenceController = require("../controllers/referenceController");

router.post("/", authenticate, referenceController.createReference);
router.get("/", authenticate, referenceController.getReferences);

module.exports = router;