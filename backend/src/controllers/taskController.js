const Task = require("../models/Task");

// GET all tasks - GLOBAL (all users can see all tasks)
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({})
      .populate("assignedTo", "firstName lastName username email")
      .populate("createdBy", "firstName lastName username email")
      .sort({ dueDate: 1 });
    res.json(tasks);
  } catch (error) {
    console.error("Get all tasks error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET task by ID - GLOBAL (all users can see any task)
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id })
      .populate("assignedTo", "firstName lastName username email")
      .populate("createdBy", "firstName lastName username email");

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
    const userId = req.user._id;
    const taskData = {
      ...req.body,
      userId,
      createdBy: userId,
    };

    const task = new Task(taskData);
    await task.save();

    // Populate the user information before returning
    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "firstName lastName username email")
      .populate("createdBy", "firstName lastName username email");

    res.status(201).json(populatedTask);
  } catch (error) {
    console.error("Create task error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: "Validation error",
        errors,
      });
    }

    res.status(400).json({ message: error.message });
  }
};

// UPDATE task - GLOBAL (any user can update any task)
const updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("assignedTo", "firstName lastName username email")
      .populate("createdBy", "firstName lastName username email");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error("Update task error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: "Validation error",
        errors,
      });
    }

    res.status(400).json({ message: error.message });
  }
};

// DELETE task - GLOBAL (any user can delete any task)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ message: error.message });
  }
};

// TOGGLE task completion - GLOBAL (any user can toggle any task)
const toggleTaskCompletion = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id })
      .populate("assignedTo", "firstName lastName username email")
      .populate("createdBy", "firstName lastName username email");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.completed = !task.completed;
    await task.save();

    res.json(task);
  } catch (error) {
    console.error("Toggle task completion error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET tasks by category - GLOBAL
const getTasksByCategory = async (req, res) => {
  try {
    const tasks = await Task.find({
      category: req.params.category,
    }).sort({ dueDate: 1 });

    res.json(tasks);
  } catch (error) {
    console.error("Get tasks by category error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET tasks by priority - GLOBAL
const getTasksByPriority = async (req, res) => {
  try {
    const tasks = await Task.find({
      priority: req.params.priority,
    }).sort({ dueDate: 1 });

    res.json(tasks);
  } catch (error) {
    console.error("Get tasks by priority error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET overdue tasks - GLOBAL
const getOverdueTasks = async (req, res) => {
  try {
    const now = new Date();
    const tasks = await Task.find({
      dueDate: { $lt: now },
      completed: false,
    }).sort({ dueDate: 1 });

    res.json(tasks);
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

    const tasks = await Task.find({
      dueDate: { $gte: now, $lte: sevenDaysFromNow },
      completed: false,
    }).sort({ dueDate: 1 });

    res.json(tasks);
  } catch (error) {
    console.error("Get upcoming tasks error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET task statistics - GLOBAL
const getTaskStats = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments({});
    const completedTasks = await Task.countDocuments({
      completed: true,
    });
    const pendingTasks = totalTasks - completedTasks;

    const highPriorityTasks = await Task.countDocuments({
      priority: "high",
      completed: false,
    });

    const now = new Date();
    const overdueTasks = await Task.countDocuments({
      dueDate: { $lt: now },
      completed: false,
    });

    // Get tasks by category
    const categoryCounts = await Task.aggregate([
      { $match: {} },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const stats = {
      total: totalTasks,
      completed: completedTasks,
      pending: pendingTasks,
      highPriority: highPriorityTasks,
      overdue: overdueTasks,
      completionRate:
        totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0,
      categories: categoryCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    };

    res.json(stats);
  } catch (error) {
    console.error("Get task stats error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ADD subtask - GLOBAL (any user can add subtasks to any task)
const addSubtask = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Subtask title is required" });
    }

    const task = await Task.findOne({ _id: req.params.id });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.subtasks.push({ title, completed: false });
    await task.save();

    res.json(task);
  } catch (error) {
    console.error("Add subtask error:", error);
    res.status(500).json({ message: error.message });
  }
};

// TOGGLE subtask completion - GLOBAL (any user can toggle subtasks)
const toggleSubtask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) {
      return res.status(404).json({ message: "Subtask not found" });
    }

    subtask.completed = !subtask.completed;
    await task.save();

    res.json(task);
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
