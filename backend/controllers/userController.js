const userService = require("../services/userService");


// Register User
const registerUser = async (req, res) => {
  try {

    const user = await userService.createUser(req.body);

    res.status(201).json({
      message: "User registered successfully",
      user
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
};

// Login User
const loginUser = async (req, res) => {
  try {

    const result = await userService.loginUser(req.body);

    res.status(200).json({
      message: "Login successful",
      token: result.token,
      user: result.user
    });

  } catch (error) {

    res.status(401).json({
      error: error.message
    });

  }
};

// Get All Users
const getUsers = async (req, res) => {
  try {

    const users = await userService.getUsers();

    res.json(users);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
};
const getCurrentUser = async (req, res) => {

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId }
  });

  res.json(user);

};

module.exports = {
  registerUser,
  loginUser,
  getUsers,
  getCurrentUser
};