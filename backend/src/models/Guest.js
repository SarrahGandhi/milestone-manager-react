const { supabase } = require("../config/database");

class Guest {
  // Create a new guest
  static async create(guestData) {
    try {
      const { data, error } = await supabase
        .from("guests")
        .insert([
          {
            name: guestData.name,
            email: guestData.email?.toLowerCase(),
            phone: guestData.phone,
            address: guestData.address,
            city: guestData.city,
            country: guestData.country || "US",
            category: guestData.category,
            notes: guestData.notes,
            user_id: guestData.userId,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return this.formatGuest(data);
    } catch (error) {
      throw error;
    }
  }

  // Find guest by ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from("guests")
        .select(
          `
          *,
          guest_selected_events(event:events(*)),
          guest_event_attendees(*),
          guest_events(*)
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return data ? this.formatGuest(data) : null;
    } catch (error) {
      throw error;
    }
  }

  // Find all guests with filters
  static async findAll(filters = {}) {
    try {
      let query = supabase
        .from("guests")
        .select(
          `
          *,
          guest_selected_events(event:events(*)),
          guest_event_attendees(*),
          guest_events(*)
        `
        )
        .order("name", { ascending: true });

      // Apply filters
      if (filters.userId) {
        query = query.eq("user_id", filters.userId);
      }
      if (filters.category) {
        query = query.eq("category", filters.category);
      }
      if (filters.search) {
        query = query.ilike("name", `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data.map((guest) => this.formatGuest(guest));
    } catch (error) {
      throw error;
    }
  }

  // Update guest
  static async update(id, updates) {
    try {
      // Convert camelCase to snake_case for database
      const dbUpdates = {};
      Object.keys(updates).forEach((key) => {
        switch (key) {
          case "userId":
            dbUpdates.user_id = updates[key];
            break;
          default:
            dbUpdates[key] = updates[key];
        }
      });

      if (dbUpdates.email) {
        dbUpdates.email = dbUpdates.email.toLowerCase();
      }

      const { data, error } = await supabase
        .from("guests")
        .update(dbUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return this.formatGuest(data);
    } catch (error) {
      throw error;
    }
  }

  // Delete guest
  static async delete(id) {
    try {
      const { error } = await supabase.from("guests").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Add selected event to guest
  static async addSelectedEvent(guestId, eventId) {
    try {
      const { data, error } = await supabase
        .from("guest_selected_events")
        .insert([
          {
            guest_id: guestId,
            event_id: eventId,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Remove selected event from guest
  static async removeSelectedEvent(guestId, eventId) {
    try {
      const { error } = await supabase
        .from("guest_selected_events")
        .delete()
        .eq("guest_id", guestId)
        .eq("event_id", eventId);

      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Update event attendee counts
  static async updateEventAttendees(guestId, eventId, attendeeData) {
    try {
      const { data, error } = await supabase
        .from("guest_event_attendees")
        .upsert([
          {
            guest_id: guestId,
            event_id: eventId,
            men: attendeeData.men || 0,
            women: attendeeData.women || 0,
            kids: attendeeData.kids || 0,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Get event attendee counts
  static async getEventAttendees(guestId, eventId) {
    try {
      const { data, error } = await supabase
        .from("guest_event_attendees")
        .select("*")
        .eq("guest_id", guestId)
        .eq("event_id", eventId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data || { men: 0, women: 0, kids: 0 };
    } catch (error) {
      throw error;
    }
  }

  // Get guests by user
  static async findByUser(userId) {
    try {
      const { data, error } = await supabase
        .from("guests")
        .select(
          `
          *,
          guest_selected_events!inner(event:events(*)),
          guest_event_attendees(*),
          guest_events(*)
        `
        )
        .eq("user_id", userId)
        .order("name", { ascending: true });

      if (error) throw error;
      return data.map((guest) => this.formatGuest(guest));
    } catch (error) {
      throw error;
    }
  }

  // Get guests by category
  static async findByCategory(category, userId = null) {
    try {
      let query = supabase
        .from("guests")
        .select(
          `
          *,
          guest_selected_events!inner(event:events(*)),
          guest_event_attendees(*),
          guest_events(*)
        `
        )
        .eq("category", category)
        .order("name", { ascending: true });

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data.map((guest) => this.formatGuest(guest));
    } catch (error) {
      throw error;
    }
  }

  // Format guest data for frontend
  static formatGuest(guest) {
    if (!guest) return null;

    const formatted = { ...guest };

    // Convert snake_case back to camelCase for frontend
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

    // Format selected events
    if (formatted.guest_selected_events) {
      formatted.selectedEvents = formatted.guest_selected_events.map(
        (gse) => gse.event.id
      );
      delete formatted.guest_selected_events;
    }

    // Format event attendees object
    if (formatted.guest_event_attendees) {
      formatted.eventAttendees = {};
      formatted.guest_event_attendees.forEach((gea) => {
        formatted.eventAttendees[gea.event_id] = {
          men: gea.men,
          women: gea.women,
          kids: gea.kids,
        };
      });
      delete formatted.guest_event_attendees;
    }

    // Format guest events (RSVP data)
    if (formatted.guest_events) {
      formatted.guestEvents = formatted.guest_events;
      delete formatted.guest_events;
    }

    // Calculate total attendees
    formatted.totalAttendees = 0;
    if (formatted.eventAttendees) {
      Object.values(formatted.eventAttendees).forEach((counts) => {
        formatted.totalAttendees +=
          (counts.men || 0) + (counts.women || 0) + (counts.kids || 0);
      });
    }

    return formatted;
  }

  // Validate guest data
  static validateGuestData(guestData) {
    const errors = [];

    if (!guestData.name || guestData.name.trim().length === 0) {
      errors.push("Name is required");
    }

    if (
      !guestData.category ||
      !["bride", "groom"].includes(guestData.category)
    ) {
      errors.push('Category must be either "bride" or "groom"');
    }

    if (guestData.email && !this.validateEmail(guestData.email)) {
      errors.push("Please enter a valid email address");
    }

    return errors;
  }

  // Validate email format
  static validateEmail(email) {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
  }
}

module.exports = Guest;
