const express = require("express");
const router = express.Router();
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsByStatus,
  getUpcomingEvents,
  updateEventStatus,
} = require("../controllers/eventController");
const {
  authenticateToken,
  optionalAuth,
  requireAdmin,
} = require("../middleware/auth");

// Public routes (no authentication required)
router.get("/upcoming", getUpcomingEvents);

// Protected routes (authentication required) - all users can view events
router.get("/", authenticateToken, getAllEvents);
router.get("/status/:status", authenticateToken, getEventsByStatus);
router.get("/:id", authenticateToken, getEventById);

// Admin-only routes for creating, updating, and deleting events
router.post("/", authenticateToken, requireAdmin, createEvent);
router.put("/:id", authenticateToken, requireAdmin, updateEvent);
router.put("/:id/status", authenticateToken, requireAdmin, updateEventStatus);
router.delete("/:id", authenticateToken, requireAdmin, deleteEvent);

module.exports = router;
