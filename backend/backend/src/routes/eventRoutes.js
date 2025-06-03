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

// GET routes
router.get("/", getAllEvents); // GET /api/events
router.get("/upcoming", getUpcomingEvents); // GET /api/events/upcoming
router.get("/status/:status", getEventsByStatus); // GET /api/events/status/published
router.get("/:id", getEventById); // GET /api/events/:id

// POST routes
router.post("/", createEvent); // POST /api/events

// PUT routes
router.put("/:id", updateEvent); // PUT /api/events/:id
router.put("/:id/status", updateEventStatus); // PUT /api/events/:id/status

// DELETE routes
router.delete("/:id", deleteEvent); // DELETE /api/events/:id

module.exports = router;
