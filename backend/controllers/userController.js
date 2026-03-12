const userService = require("../services/userService");
const sessionService = require("../services/sessionService");
const prisma = require("../config/prisma");
const jwt = require("jsonwebtoken");

// Register User
const registerUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    
    res.status(201).json({
      message: "User registered successfully",
      user
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const result = await userService.loginUser(req.body);
    
    // Create new session
    const session = await sessionService.createSession(result.user.id, req);

    const token = jwt.sign(
      { userId: result.user.id, role: result.user.role, sessionId: session.sessionId },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      refreshToken: session.refreshToken,
      user: result.user
    });

  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

// Refresh Token
const refreshToken = async (req, res) => {
  const { refreshToken: tokenInput } = req.body || {};

  if (!tokenInput) {
    return res.status(400).json({ error: "Refresh token is required" });
  }

  try {
    const sessionData = await sessionService.refreshSession(tokenInput);
    const user = await userService.getUserById(sessionData.userId);

    const newToken = jwt.sign(
      { userId: user.id, role: user.role, sessionId: sessionData.sessionId },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token: newToken,
      refreshToken: sessionData.refreshToken
    });

  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

// Logout
const logout = async (req, res) => {
  const { sessionId } = req.user;

  if (!sessionId) {
    // If sessionId is missing, it's likely an old token or a session-less token.
    // We can't revoke in DB, but we can treat it as a success for the client.
    return res.json({ message: "Logged out successfully (cleared on client)" });
  }

  try {
    // Revoke by sessionId
    await prisma.session.update({
      where: { id: sessionId },
      data: { revoked: true }
    });
    
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Unable to logout" });
  }
};

// Get All Users
const getUsers = async (req, res) => {
  try {
    const users = await userService.getUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Current User
const getCurrentUser = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshToken,
  logout,
  getUsers,
  getCurrentUser
};