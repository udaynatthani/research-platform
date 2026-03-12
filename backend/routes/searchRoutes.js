const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const router = express.Router();

const searchController = require("../controllers/searchController");

router.get("/history", authenticate, searchController.getRecent);
router.delete("/history", authenticate, searchController.clearHistory);

module.exports = router;
