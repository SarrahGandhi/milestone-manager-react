const { supabase } = require("../config/database");

class DailyMenu {
  static async create(menuData) {
    // Check if a menu already exists for this date
    const { data: existing, error: findError } = await supabase
      .from("daily_menus")
      .select("id")
      .eq("menu_date", menuData.menuDate)
      .limit(1);

    if (findError) throw findError;

    if (existing && existing.length > 0) {
      throw new Error(
        `A menu already exists for ${menuData.menuDate}. Please edit the existing menu instead.`
      );
    }

    const insert = {
      menu_date: menuData.menuDate,
      breakfast: serializeMeal(menuData.breakfast),
      lunch: serializeMeal(menuData.lunch),
      snack: serializeMeal(menuData.snack),
      dinner: serializeMeal(menuData.dinner),
      event_id: menuData.eventId || null,
      notes: menuData.notes || null,
    };

    const { data, error } = await supabase
      .from("daily_menus")
      .insert([insert])
      .select()
      .single();

    if (error) throw error;
    return this.formatMenu(data);
  }

  static async upsertByDate(menuDate, menuData) {
    // Check for ANY existing menu on this date to prevent duplicates
    const { data: existing, error: findError } = await supabase
      .from("daily_menus")
      .select("*")
      .eq("menu_date", menuDate)
      .order("created_at", { ascending: false })
      .limit(1);

    if (findError) throw findError;

    // Determine event to attach at row level: prefer explicit, otherwise pick from any meal.eventId
    const pickEventId = () => {
      if (menuData.eventId) return menuData.eventId;
      const fromMeals = [
        menuData.breakfast,
        menuData.lunch,
        menuData.snack,
        menuData.dinner,
      ]
        .map((m) => (m && typeof m === "object" ? m.eventId : undefined))
        .find((v) => v && String(v).trim() !== "");
      return fromMeals || null;
    };

    const eventId = pickEventId();

    // For update, only include fields that are explicitly provided and not null.
    // This prevents accidentally wiping an existing meal when another is edited.
    const buildUpdatePayload = () => {
      const updates = { menu_date: menuDate };
      if (menuData.breakfast !== undefined && menuData.breakfast !== null) {
        updates.breakfast = serializeMeal(menuData.breakfast);
      }
      if (menuData.lunch !== undefined && menuData.lunch !== null) {
        updates.lunch = serializeMeal(menuData.lunch);
      }
      if (menuData.snack !== undefined && menuData.snack !== null) {
        updates.snack = serializeMeal(menuData.snack);
      }
      if (menuData.dinner !== undefined && menuData.dinner !== null) {
        updates.dinner = serializeMeal(menuData.dinner);
      }
      if (menuData.notes !== undefined && menuData.notes !== null) {
        updates.notes = menuData.notes;
      }
      if (menuData.eventId !== undefined && menuData.eventId !== null) {
        updates.event_id = eventId;
      }
      return updates;
    };

    // For insert, include whatever fields are provided; allow nulls for optional
    const buildInsertPayload = () => ({
      menu_date: menuDate,
      breakfast: serializeMeal(menuData.breakfast),
      lunch: serializeMeal(menuData.lunch),
      snack: serializeMeal(menuData.snack),
      dinner: serializeMeal(menuData.dinner),
      event_id: eventId,
      notes: menuData.notes || null,
    });

    if (existing && existing.length > 0) {
      const id = existing[0].id;
      const { data, error } = await supabase
        .from("daily_menus")
        .update(buildUpdatePayload())
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return this.formatMenu(data);
    }

    const { data, error } = await supabase
      .from("daily_menus")
      .insert([buildInsertPayload()])
      .select()
      .single();
    if (error) throw error;
    return this.formatMenu(data);
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from("daily_menus")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error && error.code !== "PGRST116") throw error;
    return data ? this.formatMenu(data) : null;
  }

  static async findByDate(menuDate) {
    const { data, error } = await supabase
      .from("daily_menus")
      .select("*")
      .eq("menu_date", menuDate)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data.map((row) => this.formatMenu(row));
  }

  static async findByEvent(eventId) {
    const { data, error } = await supabase
      .from("daily_menus")
      .select("*")
      .eq("event_id", eventId)
      .order("menu_date", { ascending: true });

    if (error) throw error;
    return data.map((row) => this.formatMenu(row));
  }

  static async listEventsWithMenus() {
    const { data, error } = await supabase
      .from("daily_menus")
      .select("event_id, menu_date")
      .not("event_id", "is", null)
      .order("menu_date", { ascending: true });
    if (error) throw error;

    const eventIds = Array.from(
      new Set((data || []).map((r) => r.event_id).filter(Boolean))
    );
    if (eventIds.length === 0) return [];

    const { data: events, error: evErr } = await supabase
      .from("events")
      .select("id, title, event_date, location, status")
      .in("id", eventIds)
      .order("event_date", { ascending: true });
    if (evErr) throw evErr;

    const eventIdToDates = {};
    (data || []).forEach((r) => {
      if (!r.event_id) return;
      if (!eventIdToDates[r.event_id]) eventIdToDates[r.event_id] = new Set();
      eventIdToDates[r.event_id].add(r.menu_date);
    });

    return (events || []).map((ev) => ({
      id: ev.id,
      title: ev.title,
      eventDate: ev.event_date,
      location: ev.location,
      status: ev.status,
      menuDates: Array.from(eventIdToDates[ev.id] || []).sort(),
    }));
  }

  static async update(id, updates) {
    const dbUpdates = {};
    Object.keys(updates).forEach((key) => {
      switch (key) {
        case "menuDate":
          dbUpdates.menu_date = updates[key];
          break;
        case "breakfast":
          dbUpdates.breakfast = serializeMeal(updates[key]);
          break;
        case "lunch":
          dbUpdates.lunch = serializeMeal(updates[key]);
          break;
        case "snack":
          dbUpdates.snack = serializeMeal(updates[key]);
          break;
        case "dinner":
          dbUpdates.dinner = serializeMeal(updates[key]);
          break;
        default:
          dbUpdates[key] = updates[key];
      }
    });

    const { data, error } = await supabase
      .from("daily_menus")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return this.formatMenu(data);
  }

  static async delete(id) {
    const { error } = await supabase.from("daily_menus").delete().eq("id", id);
    if (error) throw error;
    return true;
  }

  static async listDates(startDate, endDate) {
    let query = supabase
      .from("daily_menus")
      .select("menu_date", { distinct: true })
      .order("menu_date", { ascending: true });

    if (startDate) query = query.gte("menu_date", startDate);
    if (endDate) query = query.lte("menu_date", endDate);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((row) => row.menu_date);
  }

  static formatMenu(row) {
    if (!row) return null;
    const formatted = { ...row };
    // Attempt to parse meal JSON stored as text
    formatted.breakfast = parseMeal(formatted.breakfast);
    formatted.lunch = parseMeal(formatted.lunch);
    formatted.snack = parseMeal(formatted.snack);
    formatted.dinner = parseMeal(formatted.dinner);
    if (formatted.menu_date) {
      formatted.menuDate = formatted.menu_date;
      delete formatted.menu_date;
    }
    if (formatted.event_id !== undefined) {
      formatted.eventId = formatted.event_id;
      delete formatted.event_id;
    }
    if (formatted.created_at) {
      formatted.createdAt = formatted.created_at;
      delete formatted.created_at;
    }
    if (formatted.updated_at) {
      formatted.updatedAt = formatted.updated_at;
      delete formatted.updated_at;
    }
    return formatted;
  }
}

function serializeMeal(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  // Accept strings as-is for backward compatibility
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch (e) {
    return null;
  }
}

function parseMeal(value) {
  if (!value) return value;
  if (typeof value === "object") return value; // already parsed
  if (typeof value !== "string") return null;
  // Try to parse JSON; if fails, treat as full text
  try {
    const obj = JSON.parse(value);
    return obj;
  } catch (e) {
    return { items: [], full: value, notes: "" };
  }
}

module.exports = DailyMenu;
