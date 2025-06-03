const API_BASE_URL = "http://localhost:3001/api";

// Task API service
class TaskService {
  // Get all tasks with optional filters
  static async getAllTasks(filters = {}) {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== "ALL") {
        queryParams.append(key, value);
      }
    });

    const url = `${API_BASE_URL}/tasks${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  }

  // Get single task by ID
  static async getTaskById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
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
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
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
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error toggling task completion:", error);
      throw error;
    }
  }

  // Get tasks by category
  static async getTasksByCategory(category) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/tasks/category/${category}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching tasks by category:", error);
      throw error;
    }
  }

  // Get tasks by priority
  static async getTasksByPriority(priority) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/tasks/priority/${priority}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching tasks by priority:", error);
      throw error;
    }
  }

  // Get overdue tasks
  static async getOverdueTasks() {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/overdue`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching overdue tasks:", error);
      throw error;
    }
  }

  // Get upcoming tasks
  static async getUpcomingTasks() {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/upcoming`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching upcoming tasks:", error);
      throw error;
    }
  }

  // Get task statistics
  static async getTaskStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/stats`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching task stats:", error);
      throw error;
    }
  }

  // Add subtask
  static async addSubtask(taskId, subtaskTitle) {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/subtasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: subtaskTitle }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
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
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error toggling subtask:", error);
      throw error;
    }
  }
}

export default TaskService;
