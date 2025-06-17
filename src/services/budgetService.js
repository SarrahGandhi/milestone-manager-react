import AuthService from "./authService";
import { getApiUrl } from "../config";

class BudgetService {
  // Get all budget items
  static async getAllBudgetItems() {
    try {
      const token = AuthService.getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(getApiUrl("/budget"), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch budget items");
      }

      return await response.json();
    } catch (error) {
      console.error("Error in getAllBudgetItems:", error);
      throw error;
    }
  }

  // Get budget items for a specific event
  static async getBudgetItemsByEvent(eventId) {
    try {
      const token = AuthService.getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(getApiUrl(`/budget/event/${eventId}`), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch budget items for event");
      }

      return await response.json();
    } catch (error) {
      console.error("Error in getBudgetItemsByEvent:", error);
      throw error;
    }
  }

  // Create a new budget item
  static async createBudgetItem(budgetData) {
    try {
      const token = AuthService.getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(getApiUrl("/budget"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(budgetData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create budget item");
      }

      return await response.json();
    } catch (error) {
      console.error("Error in createBudgetItem:", error);
      throw error;
    }
  }

  // Update an existing budget item
  static async updateBudgetItem(itemId, budgetData) {
    try {
      const token = AuthService.getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(getApiUrl(`/budget/${itemId}`), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(budgetData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update budget item");
      }

      return await response.json();
    } catch (error) {
      console.error("Error in updateBudgetItem:", error);
      throw error;
    }
  }

  // Delete a budget item
  static async deleteBudgetItem(itemId) {
    try {
      const token = AuthService.getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(getApiUrl(`/budget/${itemId}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete budget item");
      }

      return true;
    } catch (error) {
      console.error("Error in deleteBudgetItem:", error);
      throw error;
    }
  }

  // Get budget summary
  static async getBudgetSummary() {
    try {
      const token = AuthService.getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(getApiUrl("/budget/summary"), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch budget summary");
      }

      return await response.json();
    } catch (error) {
      console.error("Error in getBudgetSummary:", error);
      throw error;
    }
  }

  // Get category totals
  static async getCategoryTotals(eventId = null) {
    try {
      const token = AuthService.getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const url = eventId
        ? getApiUrl(`/budget/categories/${eventId}`)
        : getApiUrl("/budget/categories");

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch category totals");
      }

      return await response.json();
    } catch (error) {
      console.error("Error in getCategoryTotals:", error);
      throw error;
    }
  }
}

export default BudgetService;
