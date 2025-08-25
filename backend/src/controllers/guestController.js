// UUID validation helper
const isValidUUID = (uuid) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};
const Guest = require("../models/Guest");
const GuestEvent = require("../models/GuestEvent");
const Event = require("../models/Event");
const { sendRSVPConfirmation } = require("../utils/emailService");

// Get all guests (globally visible to all users)
const getGuests = async (req, res) => {
  try {
    const guests = await Guest.findAll();

    // Get guest events for each guest
    const guestsWithEvents = await Promise.all(
      guests.map(async (guest) => {
        const guestEvents = await GuestEvent.findByGuest(guest.id);
        return {
          ...guest,
          guestEvents,
        };
      })
    );

    res.json(guestsWithEvents);
  } catch (error) {
    console.error("Error fetching guests:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get guest by ID
const getGuestById = async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id);

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
    const {
      selectedEvents = [],
      eventAttendees = {},
      eventStatuses = {},
      ...guestData
    } = req.body || {};

    console.log("🔍 Creating guest with data:", {
      ...guestData,
      selectedEvents,
      eventAttendees,
      eventStatuses,
    });

    // Create the guest using Supabase model
    const guest = await Guest.create({ ...guestData, userId: req.user?.id });
    console.log("✅ Guest created:", guest);

    // If events were selected, persist relationships and counts/statuses
    if (Array.isArray(selectedEvents) && selectedEvents.length > 0) {
      for (const eventId of selectedEvents) {
        try {
          // Link selected event
          await Guest.addSelectedEvent(guest.id, eventId);

          // Store attendee counts per event (men/women/kids)
          const counts = eventAttendees?.[eventId] || {
            men: 0,
            women: 0,
            kids: 0,
          };
          await Guest.updateEventAttendees(guest.id, eventId, counts);

          // Create initial GuestEvent with invitation/RSVP status and attendeeCount
          const status = eventStatuses?.[eventId] || {
            invitationStatus: "not_sent",
            rsvpStatus: "pending",
          };
          const attendeeCount =
            (counts.men || 0) + (counts.women || 0) + (counts.kids || 0);

          await GuestEvent.create({
            guestId: guest.id,
            eventId,
            attendeeCount: attendeeCount || 1,
            invitationStatus: status.invitationStatus,
            rsvpStatus: status.rsvpStatus,
            userId: req.user?.id || guest.userId,
          });
        } catch (relError) {
          console.error("Error creating guest-event relations:", relError);
          // continue to next event; we'll still return created guest
        }
      }
    }

    // Return guest with attached guestEvents for frontend filtering
    const guestWithDetails = await Guest.findById(guest.id);
    const guestEvents = await GuestEvent.findByGuest(guest.id);

    res.status(201).json({ ...guestWithDetails, guestEvents });
  } catch (error) {
    console.error("❌ Error creating guest:", error);
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

    // First update the guest using Supabase method
    // Only pass actual guest table columns; relationship data is handled separately
    const guest = await Guest.update(req.params.id, {
      ...newGuestData,
    });

    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }

    // Get existing GuestEvent records for this guest
    const existingGuestEvents = await GuestEvent.findByGuest(guest.id);
    const existingEventIds = existingGuestEvents
      .map((ge) => (ge.eventId ? ge.eventId.toString() : null))
      .filter(Boolean);

    // Create or update GuestEvent records for selected events
    if (Array.isArray(newSelectedEvents) && newSelectedEvents.length > 0) {
      for (const eventId of newSelectedEvents) {
        const attendeeCount = newEventAttendees?.[eventId]
          ? (newEventAttendees[eventId].men || 0) +
            (newEventAttendees[eventId].women || 0) +
            (newEventAttendees[eventId].kids || 0)
          : 1;

        const eventStatus = (newEventStatuses && newEventStatuses[eventId]) || {
          invitationStatus: "not_sent",
          rsvpStatus: "pending",
        };

        if (!existingEventIds.includes(eventId)) {
          // Create new GuestEvent record
          const guestEventData = {
            guestId: guest.id,
            eventId,
            attendeeCount,
            invitationStatus: eventStatus.invitationStatus,
            rsvpStatus: eventStatus.rsvpStatus,
          };

          await GuestEvent.create(guestEventData);
        } else {
          // Update existing GuestEvent record
          const existingGuestEvent = existingGuestEvents.find(
            (ge) => ge.eventId && ge.eventId.toString() === eventId
          );
          if (existingGuestEvent) {
            await GuestEvent.update(existingGuestEvent.id, {
              attendeeCount,
              invitationStatus: eventStatus.invitationStatus,
              rsvpStatus: eventStatus.rsvpStatus,
            });
          }
        }
      }
    }

    // Remove GuestEvent records for unselected events
    const eventsToRemove = Array.isArray(newSelectedEvents)
      ? existingEventIds.filter(
          (eventId) => !newSelectedEvents.includes(eventId)
        )
      : [];
    if (eventsToRemove.length > 0) {
      for (const eventIdToRemove of eventsToRemove) {
        const guestEventToDelete = existingGuestEvents.find(
          (ge) => ge.eventId && ge.eventId.toString() === eventIdToRemove
        );
        if (guestEventToDelete) {
          await GuestEvent.delete(guestEventToDelete.id);
        }
      }
    }

    // Fetch updated guest data with GuestEvent records
    const updatedGuest = await Guest.findById(guest.id);
    const updatedGuestEvents = await GuestEvent.findByGuest(guest.id);

    const response = {
      ...updatedGuest,
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
    // Check if guest exists first
    const guest = await Guest.findById(req.params.id);
    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }

    // Delete the guest using Supabase method
    await Guest.delete(req.params.id);

    // Also delete any associated GuestEvent records
    // Note: This should be handled by database constraints, but let's be explicit
    const guestEvents = await GuestEvent.findByGuest(req.params.id);
    if (guestEvents && guestEvents.length > 0) {
      for (const guestEvent of guestEvents) {
        await GuestEvent.delete(guestEvent.id);
      }
    }

    res.json({ message: "Guest deleted successfully" });
  } catch (error) {
    console.error("Error deleting guest:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get RSVP data for all guests and events
const getRSVPData = async (req, res) => {
  try {
    // Get all guests with their events using Supabase method
    const guests = await Guest.findAll();

    // Get guest events for each guest
    const guestsWithEvents = await Promise.all(
      guests.map(async (guest) => {
        const guestEvents = await GuestEvent.findByGuest(guest.id);
        return {
          ...guest,
          guestEvents,
        };
      })
    );

    // Get all events using Supabase method
    const Event = require("../models/Event");
    const events = await Event.findAll();

    res.json({
      guests: guestsWithEvents,
      events,
      rsvpData: [], // We don't need this anymore since we store event data directly on guest
    });
  } catch (error) {
    console.error("Error fetching RSVP data:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update RSVP status
const upsertRSVP = async (req, res) => {
  try {
    const { guestId, eventId, rsvpStatus, invitationStatus } = req.body;

    // Validate input early to avoid DB errors
    if (!guestId || !eventId) {
      return res
        .status(400)
        .json({ message: "guestId and eventId are required" });
    }
    if (!isValidUUID(guestId)) {
      return res.status(400).json({ message: "Invalid guestId format" });
    }
    if (!isValidUUID(eventId)) {
      return res.status(400).json({ message: "Invalid eventId format" });
    }

    console.log("Updating RSVP:", {
      guestId,
      eventId,
      rsvpStatus,
      invitationStatus,
    });

    // Check if guest exists using Supabase method
    const guest = await Guest.findById(guestId);
    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }

    // Optionally verify the event exists to provide clearer errors
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Use upsert approach to avoid PGRST116 errors
    console.log(
      "Upserting GuestEvent with guestId:",
      guestId,
      "eventId:",
      eventId
    );

    const guestEventData = {
      guestId,
      eventId,
      attendeeCount: 1,
      invitationStatus: invitationStatus || "not_sent",
      rsvpStatus: rsvpStatus || "pending",
      userId: req.user?.id || guest.userId,
    };

    // Only update the fields that were provided
    if (rsvpStatus) {
      guestEventData.rsvpStatus = rsvpStatus;
    }
    if (invitationStatus) {
      guestEventData.invitationStatus = invitationStatus;
    }

    // Use updateRSVP method which has upsert functionality
    console.log("About to call GuestEvent.updateRSVP...");
    const guestEvent = await GuestEvent.updateRSVP(
      guestId,
      eventId,
      guestEventData
    );
    console.log("Upserted GuestEvent:", guestEvent);

    // Update the guest's selectedEvents if not already included
    const hasEvent =
      guest.selectedEvents && guest.selectedEvents.includes(eventId);

    if (!hasEvent) {
      await Guest.addSelectedEvent(guestId, eventId);
      console.log("Added event to guest's selectedEvents");
    }

    // Fetch the updated guest data
    const updatedGuest = await Guest.findById(guestId);

    // Get all GuestEvent records for this guest
    const guestEvents = await GuestEvent.findByGuest(guestId);

    const response = {
      ...updatedGuest,
      guestEvents,
    };

    console.log("Sending response:", response);
    res.json(response);
  } catch (error) {
    console.error("Error updating RSVP:", error);
    // Surface supabase/postgrest error details when available for easier debugging
    const status = error.status || 500;
    return res.status(status).json({
      message: status >= 500 ? "Server error" : "Request failed",
      error: error.message,
      details: error.details || error.hint || error.code || undefined,
    });
  }
};

// Lookup guest by name for wedding website
const lookupGuest = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    // Trim and prepare search term
    const searchTerm = name.trim();

    // Create search patterns for different matching strategies
    const exactMatch = new RegExp(`^${searchTerm}$`, "i");
    const firstNameMatch = new RegExp(`^${searchTerm}\\s+`, "i"); // First name + space
    const containsMatch = new RegExp(searchTerm, "i"); // Contains anywhere

    // Try different search strategies in order of preference
    let guests = [];
    let allMatchingGuests = []; // Keep track of all matches for duplicate detection

    // 1. Try exact match first - check all guests first
    allMatchingGuests = await Guest.find({
      name: exactMatch,
    }).populate("selectedEvents", "title eventDate location");

    // If we have exact matches, use them
    if (allMatchingGuests.length > 0) {
      guests = allMatchingGuests;
    } else {
      // 2. If no exact match, try first name match
      allMatchingGuests = await Guest.find({
        name: firstNameMatch,
      }).populate("selectedEvents", "title eventDate location");

      if (allMatchingGuests.length > 0) {
        guests = allMatchingGuests;
      } else {
        // 3. If still no match, try partial match anywhere in name
        allMatchingGuests = await Guest.find({
          name: containsMatch,
        }).populate("selectedEvents", "title eventDate location");

        guests = allMatchingGuests;
      }
    }

    if (guests.length === 0) {
      return res
        .status(404)
        .json({ message: "No guests found matching your search" });
    }

    // Filter guests: if multiple guests with similar names, show all (including those without events)
    // If only one guest, they must have events to proceed
    let finalGuests;
    if (guests.length > 1) {
      // Multiple guests - show all so user can choose, but mark which ones have events
      finalGuests = guests;
    } else {
      // Single guest - they must have events
      const guestWithEvents = guests.filter(
        (guest) => guest.selectedEvents && guest.selectedEvents.length > 0
      );

      if (guestWithEvents.length === 0) {
        return res.status(404).json({
          message:
            "No active invitations found for this guest. Please contact the hosts if you believe this is an error.",
        });
      }

      finalGuests = guestWithEvents;
    }

    // Get guest events for all matching guests
    const guestsWithGuestEvents = await Promise.all(
      finalGuests.map(async (guest) => {
        const guestEvents = await GuestEvent.find({
          guestId: guest._id,
        }).populate("eventId", "title eventDate location");

        return {
          ...guest.toObject(),
          guestEvents,
          hasEvents: guest.selectedEvents && guest.selectedEvents.length > 0,
        };
      })
    );

    // If only one guest found, return it directly (backward compatibility)
    if (guestsWithGuestEvents.length === 1) {
      res.json({ guest: guestsWithGuestEvents[0] });
    } else {
      // Multiple guests found, return them for selection
      res.json({ guests: guestsWithGuestEvents });
    }
  } catch (error) {
    console.error("Error looking up guest:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update RSVP status for a specific event
const updateEventRSVP = async (req, res) => {
  try {
    const { guestId, eventId } = req.params;
    const {
      rsvpStatus,
      attendeeCount,
      dietaryRestrictions,
      specialRequests,
      wantsEmailConfirmation,
      email,
    } = req.body;

    // Set default attendee count to 1 if not provided (for wedding website RSVPs)
    const finalAttendeeCount = attendeeCount || 1;

    const guestEvent = await GuestEvent.findOneAndUpdate(
      { guestId, eventId },
      {
        rsvpStatus,
        attendeeCount: finalAttendeeCount,
        dietaryRestrictions,
        specialRequests,
        rsvpDate: new Date(),
      },
      { new: true }
    ).populate("eventId", "title eventDate location");

    if (!guestEvent) {
      return res.status(404).json({ message: "Guest event not found" });
    }

    // Update the guest's eventAttendees count and email if provided
    const updateFields = {
      [`eventAttendees.${eventId}`]: finalAttendeeCount,
    };

    if (email) {
      updateFields.email = email;
    }

    await Guest.findByIdAndUpdate(guestId, {
      $set: updateFields,
    });

    // Send email confirmation if requested and email is available
    if (wantsEmailConfirmation && email && rsvpStatus !== "pending") {
      try {
        const guest = await Guest.findById(guestId);
        if (guest) {
          const emailResult = await sendRSVPConfirmation(
            guest,
            guestEvent.eventId,
            {
              rsvpStatus,
              dietaryRestrictions,
              specialRequests,
            },
            email
          );

          if (emailResult.success) {
            console.log(
              `Email confirmation sent to ${email} for ${guestEvent.eventId.title}`
            );
          } else {
            console.error(
              "Failed to send email confirmation:",
              emailResult.error
            );
          }
        }
      } catch (emailError) {
        console.error("Error sending RSVP confirmation email:", emailError);
        // Don't fail the RSVP if email fails - just log the error
      }
    }

    res.json(guestEvent);
  } catch (error) {
    console.error("Error updating RSVP:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete RSVP for a specific event
const deleteEventRSVP = async (req, res) => {
  try {
    const { guestId, eventId } = req.params;

    // Find and delete the GuestEvent record
    const guestEvent = await GuestEvent.findOneAndDelete({
      guestId,
      eventId,
    });

    if (!guestEvent) {
      return res.status(404).json({ message: "RSVP not found for this event" });
    }

    // Remove the event from the guest's selectedEvents array
    await Guest.findByIdAndUpdate(guestId, {
      $pull: { selectedEvents: eventId },
      $unset: { [`eventAttendees.${eventId}`]: "" },
    });

    res.json({ message: "RSVP deleted successfully" });
  } catch (error) {
    console.error("Error deleting RSVP:", error);
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
  deleteEventRSVP,
};
