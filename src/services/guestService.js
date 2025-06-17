import AuthService from "./authService";
import { API_BASE_URL } from "../config";

class GuestService {
  // Helper method to get headers with auth
  static getHeaders() {
    return AuthService.getAuthHeaders();
  }

  // Helper method to handle API errors
  static async handleResponse(response) {
    if (!response.ok) {
      if (response.status === 401) {
        // Unauthorized - redirect to login
        AuthService.removeToken();
        window.location.href = "/login";
        return;
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }
    return await response.json();
  }

  // Get all guests
  static async getAllGuests() {
    try {
      const response = await fetch(`${API_BASE_URL}/guests`, {
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching guests:", error);
      throw error;
    }
  }

  // Get guest statistics
  static async getGuestStats() {
    try {
      const guests = await this.getAllGuests();
      return {
        totalGuests: guests.length,
        totalInvited: guests.filter((guest) => guest.isInvited).length,
        totalConfirmed: guests.filter((guest) => guest.isConfirmed).length,
      };
    } catch (error) {
      console.error("Error fetching guest statistics:", error);
      throw error;
    }
  }

  // Get RSVP statistics
  static async getRSVPStats() {
    try {
      const guests = await this.getAllGuests();
      return {
        totalResponded: guests.filter((guest) => guest.hasResponded).length,
        totalAccepted: guests.filter(
          (guest) => guest.hasResponded && guest.isAttending
        ).length,
        totalDeclined: guests.filter(
          (guest) => guest.hasResponded && !guest.isAttending
        ).length,
      };
    } catch (error) {
      console.error("Error fetching RSVP statistics:", error);
      throw error;
    }
  }
}

export default GuestService;
