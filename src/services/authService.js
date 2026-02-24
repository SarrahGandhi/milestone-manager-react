// Use centralized API configuration
import { getApiUrl } from "../config";
import supabase from "../utils/supabase";

// Token management
const TOKEN_KEY = "milestone_manager_token";
const USER_KEY = "milestone_manager_user";

// Keep access token synchronized in localStorage for synchronous `getAuthHeaders`
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    localStorage.setItem(TOKEN_KEY, session.access_token);
    // Construct user object similar to before
    const user = {
      id: session.user.id,
      email: session.user.email,
      ...session.user.user_metadata
    };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
});

class AuthService {
  // Safely parse JSON (handles empty or non-JSON bodies)
  static async parseJsonSafe(response) {
    try {
      const text = await response.text();
      if (!text) return null;
      try {
        return JSON.parse(text);
      } catch (e) {
        return { raw: text };
      }
    } catch (e) {
      return null;
    }
  }

  // Unified fetch handler with safe JSON parsing and clearer errors
  static async request(path, options = {}) {
    const response = await fetch(getApiUrl(path), options);
    const data = await this.parseJsonSafe(response);

    if (!response.ok) {
      const message =
        (data && data.message) ||
        (typeof data?.raw === "string" && data.raw) ||
        `Request failed with status ${response.status}`;
      const error = new Error(message);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }
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
      const { email, password, ...userMetadata } = userData;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userMetadata
        }
      });

      if (error) {
        throw error;
      }

      // The onAuthStateChange will handle storing token/user if auto-login is enabled on signup.
      // Otherwise, you may need to wait for email confirmation or just return what we have.
      return { token: data.session?.access_token, user: data.user };
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  // Login user
  static async login(credentials) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) {
        throw error;
      }

      // The onAuthStateChange listener will handle updating localStorage.
      return { token: data.session.access_token, user: data.user };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // Logout user
  static async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always remove local data (handled by onAuthStateChange, but safe to keep here too)
      this.removeToken();
    }
  }

  // Get current user info
  static async getCurrentUser() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        throw new Error("Not authenticated");
      }

      const user = {
        id: session.user.id,
        email: session.user.email,
        ...session.user.user_metadata
      };
      
      this.setUser(user);
      return user;
    } catch (error) {
      console.error("Get current user error:", error);
      throw error;
    }
  }

  // Update user profile
  static async updateProfile(profileData) {
    try {
      // Assuming we are storing everything in user_metadata for now
      const { data, error } = await supabase.auth.updateUser({
        data: profileData
      });

      if (error) throw error;

      const user = {
        id: data.user.id,
        email: data.user.email,
        ...data.user.user_metadata
      };

      this.setUser(user);
      return { user };
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  }

  // Change password
  static async changePassword(passwordData) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;
      return { message: "Password updated successfully" };
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    }
  }

  // Refresh user data
  static async refreshUser() {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      if (!session) throw new Error("No session");
      
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
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        this.removeToken();
        return false;
      }

      // Check if token is expired locally first
      const payload = JSON.parse(atob(session.access_token.split(".")[1]));
      if (payload.exp * 1000 <= Date.now()) {
        console.log("Token expired locally, refreshing...");
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
           this.removeToken();
           return false;
        }
      }

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
