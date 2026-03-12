const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const router = express.Router();

const linkController = require("../controllers/linkController");

router.post("/", authenticate, linkController.createLink);
router.get("/:projectId", authenticate, linkController.getLinks);
router.delete("/:id", authenticate, linkController.deleteLink);

module.exports = router;