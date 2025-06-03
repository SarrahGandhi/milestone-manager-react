const Task = require("../models/Task");

// Get all tasks
const getAllTasks = async (req, res) => {
  try {
    const { completed, category, priority, assignedTo, overdue } = req.query;
    let filter = {};

    // Add filters if provided
    if (completed !== undefined) filter.completed = completed === "true";
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    let tasks = await Task.find(filter)
      .populate("relatedEvent")
      .sort({ dueDate: 1 });

    // Filter overdue tasks if requested
    if (overdue === "true") {
      tasks = tasks.filter(
        (task) => !task.completed && task.dueDate < new Date()
      );
    }

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single task by ID
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("relatedEvent");
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new task
const createTask = async (req, res) => {
  try {
    const task = new Task(req.body);
    const savedTask = await task.save();
    const populatedTask = await Task.findById(savedTask._id).populate(
      "relatedEvent"
    );
    res.status(201).json(populatedTask);
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: "Validation Error", errors });
    }
    res.status(500).json({ message: error.message });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("relatedEvent");
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: "Validation Error", errors });
    }
    res.status(500).json({ message: error.message });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle task completion
const toggleTaskCompletion = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.completed = !task.completed;
    const updatedTask = await task.save();
    const populatedTask = await Task.findById(updatedTask._id).populate(
      "relatedEvent"
    );

    res.json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get tasks by category
const getTasksByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const tasks = await Task.find({ category })
      .populate("relatedEvent")
      .sort({ dueDate: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get tasks by priority
const getTasksByPriority = async (req, res) => {
  try {
    const { priority } = req.params;
    const tasks = await Task.find({ priority })
      .populate("relatedEvent")
      .sort({ dueDate: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get overdue tasks
const getOverdueTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      completed: false,
      dueDate: { $lt: new Date() },
    })
      .populate("relatedEvent")
      .sort({ dueDate: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get upcoming tasks (next 7 days)
const getUpcomingTasks = async (req, res) => {
  try {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const tasks = await Task.find({
      completed: false,
      dueDate: { $gte: today, $lte: nextWeek },
    })
      .populate("relatedEvent")
      .sort({ dueDate: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get task statistics
const getTaskStats = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ completed: true });
    const pendingTasks = await Task.countDocuments({ completed: false });
    const overdueTasks = await Task.countDocuments({
      completed: false,
      dueDate: { $lt: new Date() },
    });
    const highPriorityTasks = await Task.countDocuments({
      priority: "high",
      completed: false,
    });

    const stats = {
      total: totalTasks,
      completed: completedTasks,
      pending: pendingTasks,
      overdue: overdueTasks,
      highPriority: highPriorityTasks,
      completionRate:
        totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0,
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add subtask to a task
const addSubtask = async (req, res) => {
  try {
    const { title } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.subtasks.push({ title, completed: false });
    const updatedTask = await task.save();
    const populatedTask = await Task.findById(updatedTask._id).populate(
      "relatedEvent"
    );

    res.json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle subtask completion
const toggleSubtask = async (req, res) => {
  try {
    const { subtaskId } = req.params;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const subtask = task.subtasks.id(subtaskId);
    if (!subtask) {
      return res.status(404).json({ message: "Subtask not found" });
    }

    subtask.completed = !subtask.completed;
    const updatedTask = await task.save();
    const populatedTask = await Task.findById(updatedTask._id).populate(
      "relatedEvent"
    );

    res.json(populatedTask);
  } catch (error) {
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
