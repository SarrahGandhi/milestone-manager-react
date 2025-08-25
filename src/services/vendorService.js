import { getApiUrl } from "../config";
import AuthService from "./authService";
const vendorService = {
  async list(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(getApiUrl(`/vendors${query ? `?${query}` : ""}`), {
      headers: AuthService.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch vendors");
    }
    return data;
  },
  async create(payload = {}) {
    const res = await fetch(getApiUrl(`/vendors`), {
      method: "POST",
      headers: AuthService.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to create vendor");
    }
    return data;
  },
  async update(id, payload = {}) {
    if (!id) throw new Error("Vendor id is required");
    const res = await fetch(getApiUrl(`/vendors/${id}`), {
      method: "PUT",
      headers: AuthService.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to update vendor");
    }
    return data;
  },
  async remove(id) {
    if (!id) throw new Error("Vendor id is required");
    const res = await fetch(getApiUrl(`/vendors/${id}`), {
      method: "DELETE",
      headers: AuthService.getAuthHeaders(),
    });
    if (res.status === 204) return true;
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.error || "Failed to delete vendor");
    }
    return true;
  },
};

export default vendorService;
