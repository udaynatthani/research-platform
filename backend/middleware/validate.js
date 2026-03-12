/**
 * Input validation helpers for request bodies.
 * Used as Express middleware.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateRegister = (req, res, next) => {
  const { email, username, password } = req.body;

  const errors = [];

  if (!email || typeof email !== "string") {
    errors.push("Email is required");
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push("Invalid email format");
  }

  if (!username || typeof username !== "string") {
    errors.push("Username is required");
  } else if (username.trim().length < 3) {
    errors.push("Username must be at least 3 characters");
  } else if (username.trim().length > 30) {
    errors.push("Username must be at most 30 characters");
  } else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
    errors.push("Username can only contain letters, numbers, and underscores");
  }

  if (!password || typeof password !== "string") {
    errors.push("Password is required");
  } else if (password.length < 6) {
    errors.push("Password must be at least 6 characters");
  } else if (password.length > 128) {
    errors.push("Password must be at most 128 characters");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  // Sanitize
  req.body.email = email.trim().toLowerCase();
  req.body.username = username.trim();

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  const errors = [];

  if (!email || typeof email !== "string") {
    errors.push("Email is required");
  }

  if (!password || typeof password !== "string") {
    errors.push("Password is required");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  req.body.email = email.trim().toLowerCase();

  next();
};

module.exports = {
  validateRegister,
  validateLogin
};
