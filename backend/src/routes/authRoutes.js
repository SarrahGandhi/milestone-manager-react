const express = require("express");
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
} = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/me", authenticateToken, getMe);
router.put("/profile", authenticateToken, updateProfile);
router.put("/change-password", authenticateToken, changePassword);
router.post("/logout", authenticateToken, logout);

module.exports = router;
