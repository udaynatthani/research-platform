const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/authMiddleware");
const { validateRegister, validateLogin } = require("../middleware/validate");
const { authLimiter } = require("../middleware/rateLimiter");

const userController = require("../controllers/userController");

// Public routes
router.post("/register", authLimiter, validateRegister, userController.registerUser);
router.post("/login", authLimiter, validateLogin, userController.loginUser);
router.post("/refresh-token", userController.refreshToken);
router.post("/logout", authenticate, userController.logout);

// Protected routes
router.get("/me", authenticate, userController.getCurrentUser);
router.get("/", authenticate, authorize("ADMIN"), userController.getUsers); // Only admins can list users

module.exports = router;