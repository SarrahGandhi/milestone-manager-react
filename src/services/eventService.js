import AuthService from "./authService";
import { getApiUrl } from "../config";

export async function getEvents() {
  const res = await fetch(getApiUrl("/events"), {
    headers: AuthService.getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch events");
  }
  return await res.json();
}

export async function getEventById(eventId) {
  const res = await fetch(getApiUrl(`/events/${eventId}`), {
    headers: AuthService.getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch event");
  }
  return await res.json();
}
