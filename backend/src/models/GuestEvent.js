const { supabase } = require("../config/database");

class GuestEvent {
  // Create a new guest event relationship
  static async create(guestEventData) {
    try {
      const { data, error } = await supabase
        .from("guest_events")
        .insert([
          {
            guest_id: guestEventData.guestId,
            event_id: guestEventData.eventId,
            invitation_status: guestEventData.invitationStatus || "not_sent",
            rsvp_status: guestEventData.rsvpStatus || "pending",
            rsvp_date: guestEventData.rsvpDate,
            attendee_count: guestEventData.attendeeCount || 1,
            meal_choice: guestEventData.mealChoice,
            special_requests: guestEventData.specialRequests,
            plus_one_name: guestEventData.plusOne?.name,
            plus_one_dietary_restrictions:
              guestEventData.plusOne?.dietaryRestrictions,
            notes: guestEventData.notes,
            user_id: guestEventData.userId,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return this.formatGuestEvent(data);
    } catch (error) {
      throw error;
    }
  }

  // Find guest event by ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from("guest_events")
        .select(
          `
          *,
          guest:guests(id, name, email, category),
          event:events(id, title, event_date, location),
          user:users(id, username, first_name, last_name)
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return data ? this.formatGuestEvent(data) : null;
    } catch (error) {
      throw error;
    }
  }

  // Find guest event by guest and event IDs
  static async findByGuestAndEvent(guestId, eventId) {
    try {
      const { data, error } = await supabase
        .from("guest_events")
        .select(
          `
          *,
          guest:guests(id, name, email, category),
          event:events(id, title, event_date, location),
          user:users(id, username, first_name, last_name)
        `
        )
        .eq("guest_id", guestId)
        .eq("event_id", eventId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data ? this.formatGuestEvent(data) : null;
    } catch (error) {
      throw error;
    }
  }

  // Find all guest events with filters
  static async findAll(filters = {}) {
    try {
      let query = supabase
        .from("guest_events")
        .select(
          `
          *,
          guest:guests(id, name, email, category),
          event:events(id, title, event_date, location),
          user:users(id, username, first_name, last_name)
        `
        )
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters.userId) {
        query = query.eq("user_id", filters.userId);
      }
      if (filters.guestId) {
        query = query.eq("guest_id", filters.guestId);
      }
      if (filters.eventId) {
        query = query.eq("event_id", filters.eventId);
      }
      if (filters.rsvpStatus) {
        query = query.eq("rsvp_status", filters.rsvpStatus);
      }
      if (filters.invitationStatus) {
        query = query.eq("invitation_status", filters.invitationStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data.map((guestEvent) => this.formatGuestEvent(guestEvent));
    } catch (error) {
      throw error;
    }
  }

  // Update guest event
  static async update(id, updates) {
    try {
      // Convert camelCase to snake_case for database
      const dbUpdates = {};
      Object.keys(updates).forEach((key) => {
        switch (key) {
          case "guestId":
            dbUpdates.guest_id = updates[key];
            break;
          case "eventId":
            dbUpdates.event_id = updates[key];
            break;
          case "invitationStatus":
            dbUpdates.invitation_status = updates[key];
            break;
          case "rsvpStatus":
            dbUpdates.rsvp_status = updates[key];
            break;
          case "rsvpDate":
            dbUpdates.rsvp_date = updates[key];
            break;
          case "attendeeCount":
            dbUpdates.attendee_count = updates[key];
            break;
          case "mealChoice":
            dbUpdates.meal_choice = updates[key];
            break;
          case "specialRequests":
            dbUpdates.special_requests = updates[key];
            break;
          case "plusOne":
            if (updates[key]) {
              dbUpdates.plus_one_name = updates[key].name;
              dbUpdates.plus_one_dietary_restrictions =
                updates[key].dietaryRestrictions;
            }
            break;
          case "userId":
            dbUpdates.user_id = updates[key];
            break;
          default:
            dbUpdates[key] = updates[key];
        }
      });

      const { data, error } = await supabase
        .from("guest_events")
        .update(dbUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return this.formatGuestEvent(data);
    } catch (error) {
      throw error;
    }
  }

  // Update RSVP
  static async updateRSVP(guestId, eventId, rsvpData) {
    try {
      const dbUpdates = {
        rsvp_status: rsvpData.rsvpStatus,
        rsvp_date: new Date(),
        attendee_count: rsvpData.attendeeCount || 1,
        meal_choice: rsvpData.mealChoice,
        special_requests: rsvpData.specialRequests,
      };

      if (rsvpData.plusOne) {
        dbUpdates.plus_one_name = rsvpData.plusOne.name;
        dbUpdates.plus_one_dietary_restrictions =
          rsvpData.plusOne.dietaryRestrictions;
      }

      const { data, error } = await supabase
        .from("guest_events")
        .upsert([
          {
            guest_id: guestId,
            event_id: eventId,
            ...dbUpdates,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return this.formatGuestEvent(data);
    } catch (error) {
      throw error;
    }
  }

  // Delete guest event
  static async delete(id) {
    try {
      const { error } = await supabase
        .from("guest_events")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get RSVP statistics for an event
  static async getRSVPStats(eventId) {
    try {
      const { data, error } = await supabase
        .from("guest_events")
        .select("rsvp_status, attendee_count")
        .eq("event_id", eventId);

      if (error) throw error;

      const stats = {
        total: data.length,
        confirmed: 0,
        declined: 0,
        pending: 0,
        maybe: 0,
        totalAttendees: 0,
      };

      data.forEach((guestEvent) => {
        stats[guestEvent.rsvp_status]++;
        if (guestEvent.rsvp_status === "confirmed") {
          stats.totalAttendees += guestEvent.attendee_count || 1;
        }
      });

      return stats;
    } catch (error) {
      throw error;
    }
  }

  // Get invitation statistics for an event
  static async getInvitationStats(eventId) {
    try {
      const { data, error } = await supabase
        .from("guest_events")
        .select("invitation_status")
        .eq("event_id", eventId);

      if (error) throw error;

      const stats = {
        total: data.length,
        not_sent: 0,
        sent: 0,
        delivered: 0,
        opened: 0,
      };

      data.forEach((guestEvent) => {
        stats[guestEvent.invitation_status]++;
      });

      return stats;
    } catch (error) {
      throw error;
    }
  }

  // Find guest events by event
  static async findByEvent(eventId) {
    try {
      const { data, error } = await supabase
        .from("guest_events")
        .select(
          `
          *,
          guest:guests(id, name, email, category),
          event:events(id, title, event_date, location),
          user:users(id, username, first_name, last_name)
        `
        )
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data.map((guestEvent) => this.formatGuestEvent(guestEvent));
    } catch (error) {
      throw error;
    }
  }

  // Find guest events by guest
  static async findByGuest(guestId) {
    try {
      const { data, error } = await supabase
        .from("guest_events")
        .select(
          `
          *,
          guest:guests(id, name, email, category),
          event:events(id, title, event_date, location),
          user:users(id, username, first_name, last_name)
        `
        )
        .eq("guest_id", guestId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data.map((guestEvent) => this.formatGuestEvent(guestEvent));
    } catch (error) {
      throw error;
    }
  }

  // Format guest event data for frontend
  static formatGuestEvent(guestEvent) {
    if (!guestEvent) return null;

    const formatted = { ...guestEvent };

    // Convert snake_case back to camelCase for frontend
    if (formatted.guest_id) {
      formatted.guestId = formatted.guest_id;
      delete formatted.guest_id;
    }
    if (formatted.event_id) {
      formatted.eventId = formatted.event_id;
      delete formatted.event_id;
    }
    if (formatted.invitation_status) {
      formatted.invitationStatus = formatted.invitation_status;
      delete formatted.invitation_status;
    }
    if (formatted.rsvp_status) {
      formatted.rsvpStatus = formatted.rsvp_status;
      delete formatted.rsvp_status;
    }
    if (formatted.rsvp_date) {
      formatted.rsvpDate = formatted.rsvp_date;
      delete formatted.rsvp_date;
    }
    if (formatted.attendee_count) {
      formatted.attendeeCount = formatted.attendee_count;
      delete formatted.attendee_count;
    }
    if (formatted.meal_choice) {
      formatted.mealChoice = formatted.meal_choice;
      delete formatted.meal_choice;
    }
    if (formatted.special_requests) {
      formatted.specialRequests = formatted.special_requests;
      delete formatted.special_requests;
    }
    if (formatted.user_id) {
      formatted.userId = formatted.user_id;
      delete formatted.user_id;
    }
    if (formatted.created_at) {
      formatted.createdAt = formatted.created_at;
      delete formatted.created_at;
    }
    if (formatted.updated_at) {
      formatted.updatedAt = formatted.updated_at;
      delete formatted.updated_at;
    }

    // Format plus one information
    if (formatted.plus_one_name || formatted.plus_one_dietary_restrictions) {
      formatted.plusOne = {
        name: formatted.plus_one_name,
        dietaryRestrictions: formatted.plus_one_dietary_restrictions,
      };
      delete formatted.plus_one_name;
      delete formatted.plus_one_dietary_restrictions;
    }

    return formatted;
  }

  // Validate guest event data
  static validateGuestEventData(guestEventData) {
    const errors = [];

    if (!guestEventData.guestId) {
      errors.push("Guest ID is required");
    }

    if (!guestEventData.eventId) {
      errors.push("Event ID is required");
    }

    if (
      guestEventData.invitationStatus &&
      !["not_sent", "sent", "delivered", "opened"].includes(
        guestEventData.invitationStatus
      )
    ) {
      errors.push("Invalid invitation status");
    }

    if (
      guestEventData.rsvpStatus &&
      !["pending", "confirmed", "declined", "maybe"].includes(
        guestEventData.rsvpStatus
      )
    ) {
      errors.push("Invalid RSVP status");
    }

    if (
      guestEventData.attendeeCount !== undefined &&
      (guestEventData.attendeeCount < 0 ||
        !Number.isInteger(guestEventData.attendeeCount))
    ) {
      errors.push("Attendee count must be a non-negative integer");
    }

    return errors;
  }
}

module.exports = GuestEvent;
