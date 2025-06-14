const express = require("express");
const router = express.Router();
const {
  getGuests,
  getGuestById,
  createGuest,
  updateGuest,
  deleteGuest,
  getRSVPData,
  upsertRSVP,
  lookupGuest,
  updateEventRSVP,
} = require("../controllers/guestController");
const { authenticateToken } = require("../middleware/auth");

// Wedding website routes (public) - these must come FIRST
router.get("/lookup", lookupGuest);
router.post("/:guestId/events/:eventId/rsvp", updateEventRSVP);

// RSVP management routes (protected)
router.get("/rsvp/data", authenticateToken, getRSVPData);
router.post("/rsvp", authenticateToken, upsertRSVP);

// Guest management routes (protected)
router.get("/", authenticateToken, getGuests);
router.post("/", authenticateToken, createGuest);
router.get("/:id", authenticateToken, getGuestById);
router.put("/:id", authenticateToken, updateGuest);
router.delete("/:id", authenticateToken, deleteGuest);

module.exports = router;
