const mongoose = require("mongoose");
const Guest = require("../models/Guest");
const GuestEvent = require("../models/GuestEvent");
const Event = require("../models/Event");

// Get all guests for a user
const getGuests = async (req, res) => {
  try {
    const guests = await Guest.find({ userId: req.user.id })
      .populate("selectedEvents", "title eventDate")
      .sort({ name: 1 });

    // Get GuestEvent data for each guest
    const guestsWithEventDetails = await Promise.all(
      guests.map(async (guest) => {
        const guestEvents = await GuestEvent.find({
          guestId: guest._id,
          userId: req.user.id,
        }).populate("eventId", "title eventDate");

        return {
          ...guest.toObject(),
          guestEvents,
        };
      })
    );

    res.json(guestsWithEventDetails);
  } catch (error) {
    console.error("Error fetching guests:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get guest by ID
const getGuestById = async (req, res) => {
  try {
    const guest = await Guest.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).populate("selectedEvents", "title eventDate");

    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }

    res.json(guest);
  } catch (error) {
    console.error("Error fetching guest:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create new guest
const createGuest = async (req, res) => {
  try {
    const { selectedEvents, eventAttendees, ...guestData } = req.body;
    console.log("🔍 Creating guest with data:", {
      selectedEvents,
      eventAttendees,
      ...guestData,
    });

    // First create the guest
    const guest = new Guest({
      ...guestData,
      selectedEvents,
      eventAttendees,
      userId: req.user.id,
    });

    await guest.save();
    console.log("✅ Guest saved:", guest);

    // Then create GuestEvent records
    if (selectedEvents && selectedEvents.length > 0) {
      console.log("📝 Creating GuestEvent records for events:", selectedEvents);

      const guestEvents = selectedEvents.map((eventId) => {
        const attendeeCount = eventAttendees[eventId]
          ? eventAttendees[eventId].men +
            eventAttendees[eventId].women +
            eventAttendees[eventId].kids
          : 1;

        console.log(
          `📊 Creating GuestEvent for event ${eventId} with attendee count:`,
          attendeeCount
        );

        return new GuestEvent({
          guestId: guest._id,
          eventId,
          userId: req.user.id,
          attendeeCount,
          rsvpStatus: "pending",
          invitationStatus: "not_sent",
        });
      });

      try {
        // Save each GuestEvent individually to better handle errors
        for (const guestEvent of guestEvents) {
          console.log("💾 Saving GuestEvent:", guestEvent);
          await guestEvent.save();
          console.log("✅ GuestEvent saved successfully");
        }
      } catch (error) {
        console.error("❌ Error creating GuestEvent records:", error);
        // If GuestEvent creation fails, delete the guest to maintain consistency
        await Guest.findByIdAndDelete(guest._id);
        throw error;
      }
    } else {
      console.log("⚠️ No events selected for this guest");
    }

    // Fetch the complete guest data with populated fields
    const populatedGuest = await Guest.findById(guest._id).populate(
      "selectedEvents",
      "title eventDate"
    );

    const guestEvents = await GuestEvent.find({ guestId: guest._id }).populate(
      "eventId",
      "title eventDate"
    );

    const response = {
      ...populatedGuest.toObject(),
      guestEvents,
    };

    console.log("📤 Sending response:", response);
    res.status(201).json(response);
  } catch (error) {
    console.error("❌ Error creating guest:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// Update guest
const updateGuest = async (req, res) => {
  try {
    const {
      selectedEvents: newSelectedEvents,
      eventAttendees: newEventAttendees,
      eventStatuses: newEventStatuses,
      ...newGuestData
    } = req.body;

    // Validate eventAttendees structure
    if (newEventAttendees) {
      for (const eventId in newEventAttendees) {
        const counts = newEventAttendees[eventId];
        if (!counts || typeof counts !== "object") {
          return res
            .status(400)
            .json({ message: "Invalid attendee counts structure" });
        }
        if (!("men" in counts) || !("women" in counts) || !("kids" in counts)) {
          return res
            .status(400)
            .json({ message: "Missing required attendee count fields" });
        }
        if (
          typeof counts.men !== "number" ||
          typeof counts.women !== "number" ||
          typeof counts.kids !== "number"
        ) {
          return res
            .status(400)
            .json({ message: "Attendee counts must be numbers" });
        }
      }
    }

    // First update the guest
    const guest = await Guest.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        ...newGuestData,
        selectedEvents: newSelectedEvents,
        eventAttendees: newEventAttendees,
      },
      { new: true, runValidators: true }
    ).populate("selectedEvents", "title eventDate");

    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }

    // Get existing GuestEvent records for this guest
    const existingGuestEvents = await GuestEvent.find({ guestId: guest._id });
    const existingEventIds = existingGuestEvents.map((ge) =>
      ge.eventId.toString()
    );

    // Create or update GuestEvent records for selected events
    if (newSelectedEvents && newSelectedEvents.length > 0) {
      for (const eventId of newSelectedEvents) {
        const attendeeCount = newEventAttendees[eventId]
          ? newEventAttendees[eventId].men +
            newEventAttendees[eventId].women +
            newEventAttendees[eventId].kids
          : 1;

        const eventStatus = newEventStatuses[eventId] || {
          invitationStatus: "not_sent",
          rsvpStatus: "pending",
        };

        if (!existingEventIds.includes(eventId)) {
          // Create new GuestEvent record
          const newGuestEvent = new GuestEvent({
            guestId: guest._id,
            eventId,
            userId: req.user.id,
            attendeeCount,
            invitationStatus: eventStatus.invitationStatus,
            rsvpStatus: eventStatus.rsvpStatus,
          });

          await newGuestEvent.save();
        } else {
          // Update existing GuestEvent record
          await GuestEvent.findOneAndUpdate(
            { guestId: guest._id, eventId },
            {
              attendeeCount,
              invitationStatus: eventStatus.invitationStatus,
              rsvpStatus: eventStatus.rsvpStatus,
            }
          );
        }
      }
    }

    // Remove GuestEvent records for unselected events
    const eventsToRemove = existingEventIds.filter(
      (eventId) => !newSelectedEvents.includes(eventId)
    );
    if (eventsToRemove.length > 0) {
      await GuestEvent.deleteMany({
        guestId: guest._id,
        eventId: { $in: eventsToRemove },
      });
    }

    // Fetch updated guest data with populated fields and GuestEvent records
    const populatedGuest = await Guest.findById(guest._id).populate(
      "selectedEvents",
      "title eventDate"
    );

    const updatedGuestEvents = await GuestEvent.find({
      guestId: guest._id,
    }).populate("eventId", "title eventDate");

    const response = {
      ...populatedGuest.toObject(),
      guestEvents: updatedGuestEvents,
    };

    res.json(response);
  } catch (error) {
    console.error("Error updating guest:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// Delete guest
const deleteGuest = async (req, res) => {
  try {
    const guest = await Guest.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }

    // Also delete any associated GuestEvent records
    await GuestEvent.deleteMany({ guestId: req.params.id });

    res.json({ message: "Guest deleted successfully" });
  } catch (error) {
    console.error("Error deleting guest:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get RSVP data for all guests and events
const getRSVPData = async (req, res) => {
  try {
    const guests = await Guest.find({ userId: req.user.id })
      .populate("selectedEvents", "title eventDate")
      .sort({ name: 1 });

    const events = await Event.find().sort({ eventDate: 1 });

    res.json({
      guests,
      events,
      rsvpData: [], // We don't need this anymore since we store event data directly on guest
    });
  } catch (error) {
    console.error("Error fetching RSVP data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update RSVP status
const upsertRSVP = async (req, res) => {
  try {
    const { guestId, eventId, rsvpStatus, invitationStatus } = req.body;

    const guest = await Guest.findOne({ _id: guestId, userId: req.user.id });
    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }

    // Find or create GuestEvent record
    let guestEvent = await GuestEvent.findOne({ guestId, eventId });

    if (!guestEvent) {
      // Create new GuestEvent record if it doesn't exist
      guestEvent = new GuestEvent({
        guestId,
        eventId,
        userId: req.user.id,
        attendeeCount: 1,
      });
    }

    // Update the status fields if provided
    if (rsvpStatus) {
      guestEvent.rsvpStatus = rsvpStatus;
    }
    if (invitationStatus) {
      guestEvent.invitationStatus = invitationStatus;
    }

    await guestEvent.save();

    // Update the guest's selectedEvents if not already included
    if (!guest.selectedEvents.includes(eventId)) {
      guest.selectedEvents.push(eventId);
      await guest.save();
    }

    // Fetch the updated guest with populated fields
    const updatedGuest = await Guest.findById(guestId)
      .populate("selectedEvents", "title eventDate")
      .populate({
        path: "guestEvents",
        match: { eventId },
        populate: { path: "eventId", select: "title eventDate" },
      });

    res.json(updatedGuest);
  } catch (error) {
    console.error("Error updating RSVP:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// Lookup guest by name for wedding website
const lookupGuest = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    // Case-insensitive search for the guest name and ensure they have selected events
    const guest = await Guest.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      selectedEvents: { $exists: true, $ne: [] }, // Only find guests with selected events
    }).populate("selectedEvents", "title eventDate location");

    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }

    // Get all guest events
    const guestEvents = await GuestEvent.find({ guestId: guest._id }).populate(
      "eventId",
      "title eventDate location"
    );

    // Add guest events to the response
    const guestWithEvents = {
      ...guest.toObject(),
      guestEvents,
    };

    res.json({ guest: guestWithEvents });
  } catch (error) {
    console.error("Error looking up guest:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update RSVP status for a specific event
const updateEventRSVP = async (req, res) => {
  try {
    const { guestId, eventId } = req.params;
    const { rsvpStatus, attendeeCount, dietaryRestrictions, specialRequests } =
      req.body;

    const guestEvent = await GuestEvent.findOneAndUpdate(
      { guestId, eventId },
      {
        rsvpStatus,
        attendeeCount,
        dietaryRestrictions,
        specialRequests,
        rsvpDate: new Date(),
      },
      { new: true }
    ).populate("eventId", "title eventDate location");

    if (!guestEvent) {
      return res.status(404).json({ message: "Guest event not found" });
    }

    // Update the guest's eventAttendees count
    await Guest.findByIdAndUpdate(guestId, {
      $set: {
        [`eventAttendees.${eventId}`]: attendeeCount,
      },
    });

    res.json(guestEvent);
  } catch (error) {
    console.error("Error updating RSVP:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getGuests,
  getGuestById,
  createGuest,
  updateGuest,
  deleteGuest,
  getRSVPData,
  upsertRSVP,
  lookupGuest,
  updateEventRSVP,
};
