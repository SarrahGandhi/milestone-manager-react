import AuthService from "./authService";
import { API_BASE_URL } from "../config";

// Task API service
class TaskService {
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

  // Get all tasks with optional filters
  static async getAllTasks(filters = {}) {
    console.log("TaskService: getAllTasks called with filters:", filters);

    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== "ALL") {
        queryParams.append(key, value);
      }
    });

    const url = `${API_BASE_URL}/tasks${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    console.log("TaskService: Making request to URL:", url);
    console.log("TaskService: Headers:", this.getHeaders());

    try {
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      console.log("TaskService: Response status:", response.status);
      console.log("TaskService: Response ok:", response.ok);

      const result = await this.handleResponse(response);
      console.log("TaskService: Final result:", result);

      return result;
    } catch (error) {
      console.error("TaskService: Error fetching tasks:", error);
      throw error;
    }
  }

  // Get single task by ID
  static async getTaskById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching task:", error);
      throw error;
    }
  }

  // Create new task
  static async createTask(taskData) {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(taskData),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  }

  // Update task
  static async updateTask(id, taskData) {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify(taskData),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  }

  // Delete task
  static async deleteTask(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  }

  // Toggle task completion
  static async toggleTaskCompletion(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}/toggle`, {
        method: "PUT",
        headers: this.getHeaders(),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error toggling task completion:", error);
      throw error;
    }
  }

  // Get tasks by category
  static async getTasksByCategory(category) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/tasks/category/${category}`,
        {
          headers: this.getHeaders(),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching tasks by category:", error);
      throw error;
    }
  }

  // Get tasks by priority
  static async getTasksByPriority(priority) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/tasks/priority/${priority}`,
        {
          headers: this.getHeaders(),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching tasks by priority:", error);
      throw error;
    }
  }

  // Get overdue tasks
  static async getOverdueTasks() {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/overdue`, {
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching overdue tasks:", error);
      throw error;
    }
  }

  // Get upcoming tasks
  static async getUpcomingTasks() {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/upcoming`, {
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error fetching upcoming tasks:", error);
      throw error;
    }
  }

  // Get task statistics
  static async getTaskStats() {
    try {
      // First get all tasks
      const tasks = await this.getAllTasks();

      // Calculate statistics
      return {
        totalTasks: tasks.length,
        completedTasks: tasks.filter((task) => task.completed).length,
        pendingTasks: tasks.filter((task) => !task.completed).length,
      };
    } catch (error) {
      console.error("Error fetching task statistics:", error);
      throw error;
    }
  }

  // Add subtask to task
  static async addSubtask(taskId, subtaskTitle) {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/subtasks`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ title: subtaskTitle }),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error adding subtask:", error);
      throw error;
    }
  }

  // Toggle subtask completion
  static async toggleSubtask(taskId, subtaskId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/tasks/${taskId}/subtasks/${subtaskId}/toggle`,
        {
          method: "PUT",
          headers: this.getHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Error toggling subtask:", error);
      throw error;
    }
  }
}

export default TaskService;
