const { supabase } = require("../config/database");

class Task {
  // Create a new task
  static async create(taskData) {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert([
          {
            title: taskData.title,
            description: taskData.description,
            due_date: taskData.dueDate,
            category: taskData.category || "Other",
            priority: taskData.priority || "medium",
            completed: taskData.completed || false,
            assigned_to: taskData.assignedTo,
            estimated_time: taskData.estimatedTime,
            actual_time: taskData.actualTime,
            notes: taskData.notes,
            tags: taskData.tags || [],
            completed_at: taskData.completed ? new Date() : null,
            related_event: taskData.relatedEvent,
            user_id: taskData.userId,
            created_by: taskData.createdBy,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return this.formatTask(data);
    } catch (error) {
      throw error;
    }
  }

  // Find task by ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select(
          `
          *,
          task_subtasks(*),
          task_reminders(*),
          assigned_user:assigned_to(id, username, first_name, last_name),
          related_event_data:related_event(id, title, event_date),
          created_by_user:created_by(id, username, first_name, last_name)
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return data ? this.formatTask(data) : null;
    } catch (error) {
      throw error;
    }
  }

  // Find all tasks with filters
  static async findAll(filters = {}) {
    try {
      let query = supabase
        .from("tasks")
        .select(
          `
          *,
          task_subtasks(*),
          task_reminders(*),
          assigned_user:assigned_to(id, username, first_name, last_name),
          related_event_data:related_event(id, title, event_date),
          created_by_user:created_by(id, username, first_name, last_name)
        `
        )
        .order("due_date", { ascending: true });

      // Apply filters
      if (filters.userId) {
        query = query.eq("user_id", filters.userId);
      }
      if (filters.assignedTo) {
        query = query.eq("assigned_to", filters.assignedTo);
      }
      if (filters.category) {
        query = query.eq("category", filters.category);
      }
      if (filters.priority) {
        query = query.eq("priority", filters.priority);
      }
      if (filters.completed !== undefined) {
        query = query.eq("completed", filters.completed);
      }
      if (filters.relatedEvent) {
        query = query.eq("related_event", filters.relatedEvent);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data.map((task) => this.formatTask(task));
    } catch (error) {
      throw error;
    }
  }

  // Update task
  static async update(id, updates) {
    try {
      // Convert camelCase to snake_case for database
      const dbUpdates = {};
      Object.keys(updates).forEach((key) => {
        switch (key) {
          case "dueDate":
            dbUpdates.due_date = updates[key];
            break;
          case "assignedTo":
            dbUpdates.assigned_to = updates[key];
            break;
          case "estimatedTime":
            dbUpdates.estimated_time = updates[key];
            break;
          case "actualTime":
            dbUpdates.actual_time = updates[key];
            break;
          case "completedAt":
            dbUpdates.completed_at = updates[key];
            break;
          case "relatedEvent":
            dbUpdates.related_event = updates[key];
            break;
          case "userId":
            dbUpdates.user_id = updates[key];
            break;
          case "createdBy":
            dbUpdates.created_by = updates[key];
            break;
          default:
            dbUpdates[key] = updates[key];
        }
      });

      // If task is being marked as completed, set completed_at
      if (dbUpdates.completed === true && !dbUpdates.completed_at) {
        dbUpdates.completed_at = new Date();
      } else if (dbUpdates.completed === false) {
        dbUpdates.completed_at = null;
      }

      const { data, error } = await supabase
        .from("tasks")
        .update(dbUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return this.formatTask(data);
    } catch (error) {
      throw error;
    }
  }

  // Delete task
  static async delete(id) {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Add subtask
  static async addSubtask(taskId, subtaskData) {
    try {
      const { data, error } = await supabase
        .from("task_subtasks")
        .insert([
          {
            task_id: taskId,
            title: subtaskData.title,
            completed: subtaskData.completed || false,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Update subtask
  static async updateSubtask(subtaskId, updates) {
    try {
      const { data, error } = await supabase
        .from("task_subtasks")
        .update(updates)
        .eq("id", subtaskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Delete subtask
  static async deleteSubtask(subtaskId) {
    try {
      const { error } = await supabase
        .from("task_subtasks")
        .delete()
        .eq("id", subtaskId);

      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Add reminder
  static async addReminder(taskId, reminderData) {
    try {
      const { data, error } = await supabase
        .from("task_reminders")
        .insert([
          {
            task_id: taskId,
            date: reminderData.date,
            message: reminderData.message,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Delete reminder
  static async deleteReminder(reminderId) {
    try {
      const { error } = await supabase
        .from("task_reminders")
        .delete()
        .eq("id", reminderId);

      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get overdue tasks
  static async findOverdue(userId) {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select(
          `
          *,
          task_subtasks(*),
          task_reminders(*),
          assigned_user:assigned_to(id, username, first_name, last_name),
          related_event_data:related_event(id, title, event_date),
          created_by_user:created_by(id, username, first_name, last_name)
        `
        )
        .eq("user_id", userId)
        .eq("completed", false)
        .lt("due_date", new Date().toISOString())
        .order("due_date", { ascending: true });

      if (error) throw error;
      return data.map((task) => this.formatTask(task));
    } catch (error) {
      throw error;
    }
  }

  // Get tasks by user
  static async findByUser(userId) {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select(
          `
          *,
          task_subtasks(*),
          task_reminders(*),
          assigned_user:assigned_to(id, username, first_name, last_name),
          related_event_data:related_event(id, title, event_date),
          created_by_user:created_by(id, username, first_name, last_name)
        `
        )
        .eq("user_id", userId)
        .order("due_date", { ascending: true });

      if (error) throw error;
      return data.map((task) => this.formatTask(task));
    } catch (error) {
      throw error;
    }
  }

  // Format task data for frontend
  static formatTask(task) {
    if (!task) return null;

    const formatted = { ...task };

    // Convert snake_case back to camelCase for frontend
    if (formatted.due_date) {
      formatted.dueDate = formatted.due_date;
      delete formatted.due_date;
    }
    if (formatted.assigned_to) {
      formatted.assignedTo = formatted.assigned_to;
      delete formatted.assigned_to;
    }
    if (formatted.estimated_time) {
      formatted.estimatedTime = formatted.estimated_time;
      delete formatted.estimated_time;
    }
    if (formatted.actual_time) {
      formatted.actualTime = formatted.actual_time;
      delete formatted.actual_time;
    }
    if (formatted.completed_at) {
      formatted.completedAt = formatted.completed_at;
      delete formatted.completed_at;
    }
    if (formatted.related_event) {
      formatted.relatedEvent = formatted.related_event;
      delete formatted.related_event;
    }
    if (formatted.user_id) {
      formatted.userId = formatted.user_id;
      delete formatted.user_id;
    }
    if (formatted.created_by) {
      formatted.createdBy = formatted.created_by;
      delete formatted.created_by;
    }
    if (formatted.created_at) {
      formatted.createdAt = formatted.created_at;
      delete formatted.created_at;
    }
    if (formatted.updated_at) {
      formatted.updatedAt = formatted.updated_at;
      delete formatted.updated_at;
    }

    // Format subtasks array
    if (formatted.task_subtasks) {
      formatted.subtasks = formatted.task_subtasks;
      delete formatted.task_subtasks;
    }

    // Format reminders array
    if (formatted.task_reminders) {
      formatted.reminders = formatted.task_reminders;
      delete formatted.task_reminders;
    }

    // Format related data
    if (formatted.assigned_user) {
      formatted.assignedUser = formatted.assigned_user;
      delete formatted.assigned_user;
    }
    if (formatted.related_event_data) {
      formatted.relatedEventData = formatted.related_event_data;
      delete formatted.related_event_data;
    }
    if (formatted.created_by_user) {
      formatted.createdByUser = formatted.created_by_user;
      delete formatted.created_by_user;
    }

    // Add isOverdue virtual property
    formatted.isOverdue =
      !formatted.completed && new Date(formatted.dueDate) < new Date();

    return formatted;
  }

  // Validate task data
  static validateTaskData(taskData) {
    const errors = [];

    if (!taskData.title || taskData.title.trim().length === 0) {
      errors.push("Title is required");
    }

    if (!taskData.dueDate) {
      errors.push("Due date is required");
    }

    if (!taskData.userId) {
      errors.push("User ID is required");
    }

    if (!taskData.createdBy) {
      errors.push("Created by is required");
    }

    if (
      taskData.category &&
      !["Budget", "Venue", "Vendors", "Planning", "Other"].includes(
        taskData.category
      )
    ) {
      errors.push("Invalid category");
    }

    if (
      taskData.priority &&
      !["low", "medium", "high"].includes(taskData.priority)
    ) {
      errors.push("Invalid priority");
    }

    if (taskData.estimatedTime && taskData.estimatedTime < 0) {
      errors.push("Estimated time cannot be negative");
    }

    if (taskData.actualTime && taskData.actualTime < 0) {
      errors.push("Actual time cannot be negative");
    }

    return errors;
  }
}

module.exports = Task;
