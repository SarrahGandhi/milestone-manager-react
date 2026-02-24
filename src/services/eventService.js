import supabase from "../utils/supabase";

function normalizeError(error, fallbackMessage) {
  if (!error) {
    return new Error(fallbackMessage);
  }

  const message =
    error.message || error.details || error.hint || fallbackMessage;
  return new Error(message);
}

function mapDbEventToUi(event = {}) {
  return {
    ...event,
    endTime: event.endTime ?? event.end_time ?? null,
    dressCode: event.dressCode ?? event.dress_code ?? "",
    additionalDetails:
      event.additionalDetails ?? event.additional_details ?? "",
    maxAttendees: event.maxAttendees ?? event.max_attendees ?? null,
    eventDate: event.eventDate ?? event.event_date ?? "",
    startTime: event.startTime ?? event.start_time ?? "",
    registrationRequired:
      event.registrationRequired ?? event.registration_required ?? false,
    createdAt: event.createdAt ?? event.created_at,
    updatedAt: event.updatedAt ?? event.updated_at,
    menu: Array.isArray(event.menu) ? event.menu : [],
    tags: Array.isArray(event.tags) ? event.tags : [],
    attendees: Array.isArray(event.attendees) ? event.attendees : [],
    reminders: Array.isArray(event.reminders) ? event.reminders : [],
  };
}

function mapUiEventToDb(payload = {}) {
  const mapped = {
    title: payload.title,
    description: payload.description,
    end_time: payload.endTime,
    location: payload.location,
    dress_code: payload.dressCode,
    menu: payload.menu,
    additional_details: payload.additionalDetails,
    category: payload.category,
    priority: payload.priority,
    organizer: payload.organizer,
    status: payload.status,
    max_attendees: payload.maxAttendees,
    tags: payload.tags,
    notes: payload.notes,
    side: payload.side,
    event_date: payload.eventDate,
    start_time: payload.startTime,
    registration_required: payload.registrationRequired,
    attendees: payload.attendees,
    reminders: payload.reminders,
  };

  return Object.fromEntries(
    Object.entries(mapped).filter(([, value]) => value !== undefined)
  );
}

async function fetchEventFromView(eventId) {
  const { data, error } = await supabase
    .from("events_api")
    .select("*")
    .eq("id", eventId)
    .maybeSingle();

  if (error) {
    throw normalizeError(error, "Failed to fetch event");
  }

  if (!data) {
    return null;
  }

  return mapDbEventToUi(data);
}

export async function listEvents() {
  const { data, error } = await supabase
    .from("events_api")
    .select("*")
    .order("eventDate", { ascending: true });

  if (error) {
    throw normalizeError(error, "Failed to fetch events");
  }

  return (data || []).map(mapDbEventToUi);
}

export async function getEvents() {
  return listEvents();
}

export async function getEventById(eventId) {
  const event = await fetchEventFromView(eventId);
  if (!event) {
    throw new Error("Event not found");
  }
  return event;
}

export async function createEvent(payload) {
  const insertPayload = mapUiEventToDb(payload);
  const { data, error } = await supabase
    .from("events")
    .insert(insertPayload)
    .select("id")
    .single();

  if (error) {
    throw normalizeError(error, "Failed to create event");
  }

  return fetchEventFromView(data.id);
}

export async function updateEvent(eventId, payload) {
  const updatePayload = mapUiEventToDb(payload);
  const { error } = await supabase
    .from("events")
    .update(updatePayload)
    .eq("id", eventId);

  if (error) {
    throw normalizeError(error, "Failed to update event");
  }

  const event = await fetchEventFromView(eventId);
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
