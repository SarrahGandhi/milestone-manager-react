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
const { authenticateToken, optionalAuth } = require("../middleware/auth");

// Public routes (no authentication required)
router.get("/upcoming", getUpcomingEvents);

// Protected routes (authentication required)
router.get("/", authenticateToken, getAllEvents);
router.get("/status/:status", authenticateToken, getEventsByStatus);
router.get("/:id", authenticateToken, getEventById);
router.post("/", authenticateToken, createEvent);
router.put("/:id", authenticateToken, updateEvent);
router.put("/:id/status", authenticateToken, updateEventStatus);
router.delete("/:id", authenticateToken, deleteEvent);

module.exports = router;
