import { getApiUrl } from "../config";
import AuthService from "./authService";

export async function createDailyMenu(payload) {
  const res = await fetch(getApiUrl(`/daily-menus`), {
    method: "POST",
    headers: AuthService.getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create daily menu");
  const json = await res.json();
  return json.data;
}

export async function upsertDailyMenuByDate(menuDate, payload) {
  const res = await fetch(getApiUrl(`/daily-menus/date/${menuDate}`), {
    method: "PUT",
    headers: AuthService.getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  let json = null;
  try {
    json = await res.json();
  } catch (_) {}
  if (!res.ok) {
    throw new Error(
      (json && (json.message || json.error || json.details)) ||
        `Failed to upsert daily menu (status ${res.status})`
    );
  }
  return json.data;
}

export async function getDailyMenuById(id) {
  const res = await fetch(getApiUrl(`/daily-menus/${id}`), {
    headers: AuthService.getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch daily menu");
  const json = await res.json();
  return json.data;
}

export async function getDailyMenusByDate(menuDate) {
  const res = await fetch(getApiUrl(`/daily-menus/date/${menuDate}/list`), {
    headers: AuthService.getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch daily menus by date");
  const json = await res.json();
  return json.data;
}

export async function getDailyMenusByEvent(eventId) {
  const res = await fetch(getApiUrl(`/daily-menus/event/${eventId}`), {
    headers: AuthService.getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch daily menus by event");
  const json = await res.json();
  return json.data;
}

export async function updateDailyMenu(id, payload) {
  const res = await fetch(getApiUrl(`/daily-menus/${id}`), {
    method: "PUT",
    headers: AuthService.getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update daily menu");
  const json = await res.json();
  return json.data;
}

export async function deleteDailyMenu(id) {
  const res = await fetch(getApiUrl(`/daily-menus/${id}`), {
    method: "DELETE",
    headers: AuthService.getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete daily menu");
  return true;
}

export async function listDailyMenuDates(startDate, endDate) {
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  const query = params.toString();
  const res = await fetch(
    getApiUrl(`/daily-menus/dates${query ? `?${query}` : ""}`),
    {
      headers: AuthService.getAuthHeaders(),
    }
  );
  if (!res.ok) throw new Error("Failed to fetch daily menu dates");
  const json = await res.json();
  return json.data;
}

export async function getEventsWithMenus() {
  const res = await fetch(getApiUrl(`/daily-menus/events-with-menus`), {
    headers: AuthService.getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch events with menus");
  const json = await res.json();
  return json.data;
}
