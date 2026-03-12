const express = require("express");
const authenticate = require("../middleware/authMiddleware");
const router = express.Router();

const projectController = require("../controllers/projectController");
router.post("/", authenticate,projectController.createProject);
router.get("/",authenticate, projectController.getProjects);
router.get("/:id", projectController.getProject);

module.exports = router;