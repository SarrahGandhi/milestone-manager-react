const express = require("express");
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
  getAllUsers,
  updateUserRole,
  deleteUser,
  createUser,
} = require("../controllers/authController");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.post("/logout", protect, logout);

// Admin-only routes
router.get("/users", protect, adminOnly, getAllUsers);
router.post("/users", protect, adminOnly, createUser);
router.put("/users/:id/role", protect, adminOnly, updateUserRole);
router.delete("/users/:id", protect, adminOnly, deleteUser);

module.exports = router;
