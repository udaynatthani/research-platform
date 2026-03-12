const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const router = express.Router();

const activityController = require("../controllers/activityController");

router.get("/feed", authenticate, activityController.getUserFeed);
router.get("/global", authenticate, activityController.getGlobalFeed);

module.exports = router;
