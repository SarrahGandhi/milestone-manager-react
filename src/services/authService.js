// Use relative URL if in development, or environment variable
const API_BASE_URL =
  process.env.NODE_ENV === "production" ? "/api" : "http://localhost:5001/api";

// Token management
const TOKEN_KEY = "milestone_manager_token";
const USER_KEY = "milestone_manager_user";

class AuthService {
  // Get token from localStorage
  static getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  // Set token in localStorage
  static setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  // Remove token from localStorage
  static removeToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  // Get user from localStorage
  static getUser() {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Set user in localStorage
  static setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  // Check if user is authenticated
  static isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Check if token is expired (simple check - you might want more robust validation)
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 > Date.now();
    } catch (error) {
      return false;
    }
  }

  // Get authorization header
  static getAuthHeaders() {
    const token = this.getToken();
    return token
      ? {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      : {
          "Content-Type": "application/json",
        };
  }

  // Register new user
  static async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Store token and user data
      this.setToken(data.token);
      this.setUser(data.user);

      return data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  // Login user
  static async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store token and user data
      this.setToken(data.token);
      this.setUser(data.user);

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // Logout user
  static async logout() {
    try {
      const token = this.getToken();
      if (token) {
        // Optional: Call backend logout endpoint
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: this.getAuthHeaders(),
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always remove local data
      this.removeToken();
    }
  }

  // Get current user info
  static async getCurrentUser() {
    try {
      if (!this.isAuthenticated()) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.removeToken();
          throw new Error("Authentication expired");
        }
        throw new Error("Failed to get user info");
      }

      const data = await response.json();
      this.setUser(data.user);
      return data.user;
    } catch (error) {
      console.error("Get current user error:", error);
      throw error;
    }
  }

  // Update user profile
  static async updateProfile(profileData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Profile update failed");
      }

      this.setUser(data.user);
      return data;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  }

  // Change password
  static async changePassword(passwordData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Password change failed");
      }

      return data;
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    }
  }

  // Refresh user data
  static async refreshUser() {
    try {
      return await this.getCurrentUser();
    } catch (error) {
      console.error("Refresh user error:", error);
      // If refresh fails, user might need to log in again
      this.removeToken();
      throw error;
    }
  }

  // Check token validity and refresh if needed
  static async validateToken() {
    try {
      if (!this.getToken()) {
        return false;
      }

      // First, do a basic token structure check
      const token = this.getToken();
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        // Check if token is expired locally first
        if (payload.exp * 1000 <= Date.now()) {
          console.log("Token expired locally, removing...");
          this.removeToken();
          return false;
        }
      } catch (error) {
        console.log("Invalid token structure, removing...");
        this.removeToken();
        return false;
      }

      // Then validate with the server
      await this.getCurrentUser();
      return true;
    } catch (error) {
      console.log("Token validation failed, clearing token:", error.message);
      this.removeToken();
      return false;
    }
  }

  // Add a method to explicitly clear all auth data
  static clearAuthData() {
    this.removeToken();
    console.log("All authentication data cleared");
  }
}

export default AuthService;
