const rateLimit = require("express-rate-limit");

/**
 * Rate limiter for authentication endpoints.
 * Prevents brute-force attacks on login/register.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 requests per window
  message: {
    error: "Too many authentication attempts. Please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * General API rate limiter.
 * Applies to all routes.
 */
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // max 100 requests per minute
  message: {
    error: "Too many requests. Please slow down."
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  authLimiter,
  apiLimiter
};
