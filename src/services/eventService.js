import supabase from "../utils/supabase";

function normalizeError(error, fallbackMessage) {
  if (!error) {
    return new Error(fallbackMessage);
  }

  const message =
    error.message || error.details || error.hint || fallbackMessage;
  return new Error(message);
}

function sanitizeEventPayload(payload = {}) {
  const cleaned = {
    ...payload,
    menu: Array.isArray(payload.menu) ? payload.menu : undefined,
    tags: Array.isArray(payload.tags) ? payload.tags : undefined,
    attendees: Array.isArray(payload.attendees) ? payload.attendees : undefined,
    reminders: Array.isArray(payload.reminders) ? payload.reminders : undefined,
  };

  return Object.fromEntries(
    Object.entries(cleaned).filter(([, value]) => value !== undefined)
  );
}

async function fetchEventById(eventId) {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .maybeSingle();

  if (error) {
    throw normalizeError(error, "Failed to fetch event");
  }

  if (!data) {
    return null;
  }

  return data;
}

export async function listEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });

  if (error) {
    throw normalizeError(error, "Failed to fetch events");
  }

  return data || [];
}

export async function getEvents() {
  return listEvents();
}

export async function getEventById(eventId) {
  const event = await fetchEventById(eventId);
  if (!event) {
    throw new Error("Event not found");
  }
  return event;
}

export async function createEvent(payload) {
  const insertPayload = sanitizeEventPayload(payload);
  const { data, error } = await supabase
    .from("events")
    .insert(insertPayload)
    .select("id")
    .single();

  if (error) {
    throw normalizeError(error, "Failed to create event");
  }

  return fetchEventById(data.id);
}

export async function updateEvent(eventId, payload) {
  const updatePayload = sanitizeEventPayload(payload);
  const { error } = await supabase
    .from("events")
    .update(updatePayload)
    .eq("id", eventId);

  if (error) {
    throw normalizeError(error, "Failed to update event");
  }

  const event = await fetchEventById(eventId);
  if (!event) {
    throw new Error("Event not found");
  }

  return event;
}

export async function deleteEvent(eventId) {
  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) {
    throw normalizeError(error, "Failed to delete event");
  }
}
