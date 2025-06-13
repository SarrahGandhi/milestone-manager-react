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
} = require("../controllers/guestController");
const { authenticateToken } = require("../middleware/auth");

// Guest management routes
router.get("/", authenticateToken, getGuests);
router.get("/:id", authenticateToken, getGuestById);
router.post("/", authenticateToken, createGuest);
router.put("/:id", authenticateToken, updateGuest);
router.delete("/:id", authenticateToken, deleteGuest);

// RSVP management routes
router.get("/rsvp/data", authenticateToken, getRSVPData);
router.post("/rsvp", authenticateToken, upsertRSVP);

module.exports = router;
