const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");

const userController = require("../controllers/userController");
router.get("/me", authenticate, userController.getCurrentUser);
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/", userController.getUsers);

module.exports = router;