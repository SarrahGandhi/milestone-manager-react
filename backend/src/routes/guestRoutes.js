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
  deleteEventRSVP,
} = require("../controllers/guestController");
const { authenticateToken } = require("../middleware/auth");
const { sendRSVPConfirmation } = require("../utils/emailService");

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
router.delete(
  "/:guestId/events/:eventId/rsvp",
  authenticateToken,
  deleteEventRSVP
);

// Test email endpoint
router.post("/test-email", async (req, res) => {
  try {
    console.log("🧪 Testing email functionality...");

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required for testing" });
    }

    // Create fake test data
    const testGuest = { name: "Test User", email };
    const testEvent = {
      title: "Test Event",
      eventDate: new Date(),
      location: "Test Location",
    };
    const testRSVP = {
      rsvpStatus: "confirmed",
      dietaryRestrictions: "Test dietary restrictions",
      specialRequests: "Test special requests",
    };

    const result = await sendRSVPConfirmation(
      testGuest,
      testEvent,
      testRSVP,
      email
    );

    if (result.success) {
      res.json({
        success: true,
        message: "Test email sent successfully!",
        messageId: result.messageId,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error("❌ Error in test email:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
