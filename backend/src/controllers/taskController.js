const Task = require("../models/Task");

// GET all tasks - GLOBAL (all users can see all tasks)
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll();
    res.json(tasks);
  } catch (error) {
    console.error("Get all tasks error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET task by ID - GLOBAL (all users can see any task)
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error("Get task by ID error:", error);
    res.status(500).json({ message: error.message });
  }
};

// CREATE new task - Still tracks creator
const createTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const taskData = {
      ...req.body,
      userId,
      createdBy: userId,
    };

    // Validate task data
    const validationErrors = Task.validateTaskData(taskData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: "Validation error",
        errors: validationErrors,
      });
    }

    const task = await Task.create(taskData);
    res.status(201).json(task);
  } catch (error) {
    console.error("Create task error:", error);
    res.status(400).json({ message: error.message });
  }
};

// UPDATE task - Role-based: Admin can update any task, users can only update their own tasks
const updateTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log("UPDATE TASK DEBUG:", {
      userId,
      userRole,
      taskId: req.params.id,
      requestBody: req.body,
    });

    // First, get the existing task to check ownership
    const existingTask = await Task.findById(req.params.id);
    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    console.log("EXISTING TASK DEBUG:", {
      taskId: existingTask.id,
      assignedTo: existingTask.assignedTo,
      createdBy: existingTask.createdBy,
      assignedToType: typeof existingTask.assignedTo,
      createdByType: typeof existingTask.createdBy,
      userIdType: typeof userId,
    });

    // Check permissions: Admin can edit any task, users can only edit their own tasks
    const canEdit =
      userRole === "admin" ||
      (existingTask.assignedTo && existingTask.assignedTo === userId) ||
      (existingTask.createdBy && existingTask.createdBy === userId);

    console.log("PERMISSION CHECK DEBUG:", {
      canEdit,
      isAdmin: userRole === "admin",
      assignedToMatch:
        existingTask.assignedTo && existingTask.assignedTo === userId,
      createdByMatch:
        existingTask.createdBy && existingTask.createdBy === userId,
    });

    if (!canEdit) {
      return res.status(403).json({
        message:
          "Access denied. You can only edit tasks assigned to you or created by you.",
      });
    }

    // Validate task data (skip userId and createdBy validation for updates)
    const validationErrors = Task.validateTaskData(req.body, false); // false = skip required field validation
    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: "Validation error",
        errors: validationErrors,
      });
    }

    const task = await Task.update(req.params.id, req.body);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error("Update task error:", error);
    res.status(400).json({ message: error.message });
  }
};

// DELETE task - Role-based: Admin can delete any task, users can only delete their own tasks
const deleteTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // First, get the existing task to check ownership
    const existingTask = await Task.findById(req.params.id);
    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check permissions: Admin can delete any task, users can only delete their own tasks
    const canDelete =
      userRole === "admin" ||
      (existingTask.assignedTo && existingTask.assignedTo === userId) ||
      (existingTask.createdBy && existingTask.createdBy === userId);

    if (!canDelete) {
      return res.status(403).json({
        message:
          "Access denied. You can only delete tasks assigned to you or created by you.",
      });
    }

    const success = await Task.delete(req.params.id);

    if (!success) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ message: error.message });
  }
};

// TOGGLE task completion - Role-based: Admin can toggle any task, users can only toggle their own tasks
const toggleTaskCompletion = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check permissions: Admin can toggle any task, users can only toggle their own tasks
    const canToggle =
      userRole === "admin" ||
      (task.assignedTo && task.assignedTo === userId) ||
      (task.createdBy && task.createdBy === userId);

    if (!canToggle) {
      return res.status(403).json({
        message:
          "Access denied. You can only toggle completion for tasks assigned to you or created by you.",
      });
    }

    const updatedTask = await Task.update(req.params.id, {
      completed: !task.completed,
    });
    res.json(updatedTask);
  } catch (error) {
    console.error("Toggle task completion error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET tasks by category - GLOBAL
const getTasksByCategory = async (req, res) => {
  try {
    const tasks = await Task.findAll({ category: req.params.category });
    res.json(tasks);
  } catch (error) {
    console.error("Get tasks by category error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET tasks by priority - GLOBAL
const getTasksByPriority = async (req, res) => {
  try {
    const tasks = await Task.findAll({ priority: req.params.priority });
    res.json(tasks);
  } catch (error) {
    console.error("Get tasks by priority error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET overdue tasks - GLOBAL
const getOverdueTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll({ completed: false });
    const overdueTasks = tasks.filter((task) => task.isOverdue);
    res.json(overdueTasks);
  } catch (error) {
    console.error("Get overdue tasks error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET upcoming tasks - GLOBAL
const getUpcomingTasks = async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const tasks = await Task.findAll({ completed: false });
    const upcomingTasks = tasks.filter((task) => {
      const dueDate = new Date(task.dueDate);
      return dueDate >= now && dueDate <= sevenDaysFromNow;
    });

    res.json(upcomingTasks);
  } catch (error) {
    console.error("Get upcoming tasks error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET task statistics - GLOBAL
const getTaskStats = async (req, res) => {
  try {
    const allTasks = await Task.findAll({});

    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter((task) => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const highPriorityTasks = allTasks.filter(
      (task) => task.priority === "high" && !task.completed
    ).length;
    const overdueTasks = allTasks.filter((task) => task.isOverdue).length;

    // Get tasks by category
    const categoryCounts = allTasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {});

    const stats = {
      total: totalTasks,
      completed: completedTasks,
      pending: pendingTasks,
      highPriority: highPriorityTasks,
      overdue: overdueTasks,
      completionRate:
        totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0,
      categories: categoryCounts,
    };

    res.json(stats);
  } catch (error) {
    console.error("Get task stats error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ADD subtask - Role-based: Admin can add subtasks to any task, users can only add to their own tasks
const addSubtask = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Subtask title is required" });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check permissions: Admin can add subtasks to any task, users can only add to their own tasks
    const canAddSubtask =
      userRole === "admin" ||
      (task.assignedTo && task.assignedTo === userId) ||
      (task.createdBy && task.createdBy === userId);

    if (!canAddSubtask) {
      return res.status(403).json({
        message:
          "Access denied. You can only add subtasks to tasks assigned to you or created by you.",
      });
    }

    const subtask = await Task.addSubtask(req.params.id, {
      title,
      completed: false,
    });
    res.json(subtask);
  } catch (error) {
    console.error("Add subtask error:", error);
    res.status(500).json({ message: error.message });
  }
};

// TOGGLE subtask completion - Role-based: Admin can toggle any subtask, users can only toggle their own
const toggleSubtask = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check permissions: Admin can toggle any subtask, users can only toggle their own
    const canToggleSubtask =
      userRole === "admin" ||
      (task.assignedTo && task.assignedTo === userId) ||
      (task.createdBy && task.createdBy === userId);

    if (!canToggleSubtask) {
      return res.status(403).json({
        message:
          "Access denied. You can only toggle subtasks for tasks assigned to you or created by you.",
      });
    }

    const subtask = task.subtasks?.find((st) => st.id === req.params.subtaskId);
    if (!subtask) {
      return res.status(404).json({ message: "Subtask not found" });
    }

    const updatedSubtask = await Task.updateSubtask(req.params.subtaskId, {
      completed: !subtask.completed,
    });
    res.json(updatedSubtask);
  } catch (error) {
    console.error("Toggle subtask error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
  getTasksByCategory,
  getTasksByPriority,
  getOverdueTasks,
  getUpcomingTasks,
  getTaskStats,
  addSubtask,
  toggleSubtask,
};
