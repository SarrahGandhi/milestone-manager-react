const Task = require("../models/Task");

// GET all tasks for authenticated user
const getAllTasks = async (req, res) => {
  try {
    const userId = req.user._id;
    const tasks = await Task.find({ userId }).sort({ dueDate: 1 });
    res.json(tasks);
  } catch (error) {
    console.error("Get all tasks error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET task by ID (user-specific)
const getTaskById = async (req, res) => {
  try {
    const userId = req.user._id;
    const task = await Task.findOne({ _id: req.params.id, userId });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error("Get task by ID error:", error);
    res.status(500).json({ message: error.message });
  }
};

// CREATE new task
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

    res.status(201).json(task);
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

// UPDATE task
const updateTask = async (req, res) => {
  try {
    const userId = req.user._id;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId },
      req.body,
      { new: true, runValidators: true }
    );

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

// DELETE task
const deleteTask = async (req, res) => {
  try {
    const userId = req.user._id;
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ message: error.message });
  }
};

// TOGGLE task completion
const toggleTaskCompletion = async (req, res) => {
  try {
    const userId = req.user._id;
    const task = await Task.findOne({ _id: req.params.id, userId });

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

// GET tasks by category
const getTasksByCategory = async (req, res) => {
  try {
    const userId = req.user._id;
    const tasks = await Task.find({
      userId,
      category: req.params.category,
    }).sort({ dueDate: 1 });

    res.json(tasks);
  } catch (error) {
    console.error("Get tasks by category error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET tasks by priority
const getTasksByPriority = async (req, res) => {
  try {
    const userId = req.user._id;
    const tasks = await Task.find({
      userId,
      priority: req.params.priority,
    }).sort({ dueDate: 1 });

    res.json(tasks);
  } catch (error) {
    console.error("Get tasks by priority error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET overdue tasks
const getOverdueTasks = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const tasks = await Task.find({
      userId,
      dueDate: { $lt: now },
      completed: false,
    }).sort({ dueDate: 1 });

    res.json(tasks);
  } catch (error) {
    console.error("Get overdue tasks error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET upcoming tasks
const getUpcomingTasks = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const tasks = await Task.find({
      userId,
      dueDate: { $gte: now, $lte: sevenDaysFromNow },
      completed: false,
    }).sort({ dueDate: 1 });

    res.json(tasks);
  } catch (error) {
    console.error("Get upcoming tasks error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET task statistics
const getTaskStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalTasks = await Task.countDocuments({ userId });
    const completedTasks = await Task.countDocuments({
      userId,
      completed: true,
    });
    const pendingTasks = totalTasks - completedTasks;

    const highPriorityTasks = await Task.countDocuments({
      userId,
      priority: "high",
      completed: false,
    });

    const now = new Date();
    const overdueTasks = await Task.countDocuments({
      userId,
      dueDate: { $lt: now },
      completed: false,
    });

    // Get tasks by category
    const categoryCounts = await Task.aggregate([
      { $match: { userId: userId } },
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

// ADD subtask
const addSubtask = async (req, res) => {
  try {
    const userId = req.user._id;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Subtask title is required" });
    }

    const task = await Task.findOne({ _id: req.params.id, userId });

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

// TOGGLE subtask completion
const toggleSubtask = async (req, res) => {
  try {
    const userId = req.user._id;
    const task = await Task.findOne({ _id: req.params.id, userId });

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
