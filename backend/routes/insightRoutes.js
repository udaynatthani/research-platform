const express = require("express");
const router = express.Router();

const insightController = require("../controllers/insightController");

router.post("/", insightController.createInsight);
router.get("/", insightController.getInsights);

module.exports = router;