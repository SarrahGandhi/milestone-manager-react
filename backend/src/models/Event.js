const { supabase } = require("../config/database");

class Event {
  // Create a new event
  static async create(eventData) {
    try {
      const { data, error } = await supabase
        .from("events")
        .insert([
          {
            title: eventData.title,
            description: eventData.description,
            event_date: eventData.eventDate,
            start_time: eventData.startTime,
            end_time: eventData.endTime,
            location: eventData.location,
            dress_code: eventData.dressCode,
            menu: eventData.menu || [],
            additional_details: eventData.additionalDetails,
            category: eventData.category || "other",
            priority: eventData.priority || "medium",
            organizer: eventData.organizer,
            status: eventData.status || "draft",
            side: eventData.side || "both",
            max_attendees: eventData.maxAttendees,
            registration_required: eventData.registrationRequired || false,
            tags: eventData.tags || [],
            notes: eventData.notes,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return this.formatEvent(data);
    } catch (error) {
      throw error;
    }
  }

  // Find event by ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from("events")
        .select(
          `
          *,
          event_attendees(*),
          event_reminders(*)
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return data ? this.formatEvent(data) : null;
    } catch (error) {
      throw error;
    }
  }

  // Find all events
  static async findAll(filters = {}) {
    try {
      let query = supabase
        .from("events")
        .select(
          `
          *,
          event_attendees(*),
          event_reminders(*)
        `
        )
        .order("event_date", { ascending: true });

      // Apply filters
      if (filters.category) {
        query = query.eq("category", filters.category);
      }
      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.priority) {
        query = query.eq("priority", filters.priority);
      }
      if (filters.startDate) {
        query = query.gte("event_date", filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte("event_date", filters.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data.map((event) => this.formatEvent(event));
    } catch (error) {
      throw error;
    }
  }

  // Update event
  static async update(id, updates) {
    try {
      // Convert camelCase to snake_case for database
      const dbUpdates = {};
      Object.keys(updates).forEach((key) => {
        switch (key) {
          case "eventDate":
            dbUpdates.event_date = updates[key];
            break;
          case "startTime":
            dbUpdates.start_time = updates[key];
            break;
          case "endTime":
            dbUpdates.end_time = updates[key];
            break;
          case "dressCode":
            dbUpdates.dress_code = updates[key];
            break;
          case "additionalDetails":
            dbUpdates.additional_details = updates[key];
            break;
          case "maxAttendees":
            dbUpdates.max_attendees = updates[key];
            break;
          case "registrationRequired":
            dbUpdates.registration_required = updates[key];
            break;
          default:
            dbUpdates[key] = updates[key];
        }
      });

      const { data, error } = await supabase
        .from("events")
        .update(dbUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return this.formatEvent(data);
    } catch (error) {
      throw error;
    }
  }

  // Delete event
  static async delete(id) {
    try {
      const { error } = await supabase.from("events").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Add attendee to event
  static async addAttendee(eventId, attendeeData) {
    try {
      const { data, error } = await supabase
        .from("event_attendees")
        .insert([
          {
            event_id: eventId,
            name: attendeeData.name,
            email: attendeeData.email,
            role: attendeeData.role,
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

  // Remove attendee from event
  static async removeAttendee(eventId, attendeeId) {
    try {
      const { error } = await supabase
        .from("event_attendees")
        .delete()
        .eq("event_id", eventId)
        .eq("id", attendeeId);

      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Add reminder to event
  static async addReminder(eventId, reminderData) {
    try {
      const { data, error } = await supabase
        .from("event_reminders")
        .insert([
          {
            event_id: eventId,
            type: reminderData.type,
            time: reminderData.time,
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

  // Remove reminder from event
  static async removeReminder(eventId, reminderId) {
    try {
      const { error } = await supabase
        .from("event_reminders")
        .delete()
        .eq("event_id", eventId)
        .eq("id", reminderId);

      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get events by date range
  static async findByDateRange(startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from("events")
        .select(
          `
          *,
          event_attendees(*),
          event_reminders(*)
        `
        )
        .gte("event_date", startDate)
        .lte("event_date", endDate)
        .order("event_date", { ascending: true });

      if (error) throw error;
      return data.map((event) => this.formatEvent(event));
    } catch (error) {
      throw error;
    }
  }

  // Get upcoming events
  static async findUpcoming(limit = 10) {
    try {
      const { data, error } = await supabase
        .from("events")
        .select(
          `
          *,
          event_attendees(*),
          event_reminders(*)
        `
        )
        .gte("event_date", new Date().toISOString().split("T")[0])
        .order("event_date", { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data.map((event) => this.formatEvent(event));
    } catch (error) {
      throw error;
    }
  }

  // Format event data for frontend
  static formatEvent(event) {
    if (!event) return null;

    const formatted = { ...event };

    // Convert snake_case back to camelCase for frontend
    if (formatted.event_date) {
      formatted.eventDate = formatted.event_date;
      delete formatted.event_date;
    }
    if (formatted.start_time) {
      formatted.startTime = formatted.start_time;
      delete formatted.start_time;
    }
    if (formatted.end_time) {
      formatted.endTime = formatted.end_time;
      delete formatted.end_time;
    }
    if (formatted.dress_code) {
      formatted.dressCode = formatted.dress_code;
      delete formatted.dress_code;
    }
    if (formatted.additional_details) {
      formatted.additionalDetails = formatted.additional_details;
      delete formatted.additional_details;
    }
    if (formatted.max_attendees) {
      formatted.maxAttendees = formatted.max_attendees;
      delete formatted.max_attendees;
    }
    if (formatted.registration_required !== undefined) {
      formatted.registrationRequired = formatted.registration_required;
      delete formatted.registration_required;
    }
    if (formatted.created_at) {
      formatted.createdAt = formatted.created_at;
      delete formatted.created_at;
    }
    if (formatted.updated_at) {
      formatted.updatedAt = formatted.updated_at;
      delete formatted.updated_at;
    }

    // Format attendees array
    if (formatted.event_attendees) {
      formatted.attendees = formatted.event_attendees;
      delete formatted.event_attendees;
    }

    // Format reminders array
    if (formatted.event_reminders) {
      formatted.reminders = formatted.event_reminders;
      delete formatted.event_reminders;
    }

    return formatted;
  }

  // Validate event data
  static validateEventData(eventData) {
    const errors = [];

    if (!eventData.title || eventData.title.trim().length === 0) {
      errors.push("Title is required");
    }

    if (!eventData.eventDate) {
      errors.push("Event date is required");
    }

    if (!eventData.startTime) {
      errors.push("Start time is required");
    }

    if (!eventData.location || eventData.location.trim().length === 0) {
      errors.push("Location is required");
    }

    if (!eventData.organizer || eventData.organizer.trim().length === 0) {
      errors.push("Organizer is required");
    }

    if (
      eventData.category &&
      ![
        "milestone",
        "meeting",
        "celebration",
        "deadline",
        "workshop",
        "other",
      ].includes(eventData.category)
    ) {
      errors.push("Invalid category");
    }

    if (
      eventData.priority &&
      !["low", "medium", "high", "urgent"].includes(eventData.priority)
    ) {
      errors.push("Invalid priority");
    }

    if (
      eventData.status &&
      !["draft", "published", "cancelled", "completed"].includes(
        eventData.status
      )
    ) {
      errors.push("Invalid status");
    }

    if (eventData.maxAttendees && eventData.maxAttendees < 0) {
      errors.push("Max attendees cannot be negative");
    }

    if (
      eventData.side &&
      !["bride", "groom", "both"].includes(eventData.side)
    ) {
      errors.push("Invalid side - must be bride, groom, or both");
    }

    return errors;
  }
}

module.exports = Event;
