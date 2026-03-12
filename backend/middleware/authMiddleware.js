const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

/**
 * Authenticate middleware — verifies JWT from Authorization header.
 * Sets req.user = { userId, role }
 */
const authenticate = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token missing" });
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();

  } catch (error) {

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }

    res.status(401).json({ error: "Invalid token" });

  }

};

/**
 * Role-based authorization middleware.
 * Usage: router.get("/admin", authenticate, authorize("ADMIN"), handler)
 */
const authorize = (...roles) => {
  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Insufficient permissions. Required role: " + roles.join(" or ")
      });
    }

    next();
  };
};

/**
 * Optional auth middleware — same as authenticate but doesn't reject.
 * Sets req.user if token is valid, otherwise continues without it.
 */
const optionalAuth = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (error) {
    // Token invalid but optional — continue without user
  }

  next();
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth
};