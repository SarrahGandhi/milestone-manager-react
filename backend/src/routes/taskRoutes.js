const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const {
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
} = require("../controllers/taskController");

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET routes
router.get("/", getAllTasks); // GET /api/tasks
router.get("/stats", getTaskStats); // GET /api/tasks/stats
router.get("/upcoming", getUpcomingTasks); // GET /api/tasks/upcoming
router.get("/overdue", getOverdueTasks); // GET /api/tasks/overdue
router.get("/category/:category", getTasksByCategory); // GET /api/tasks/category/Budget
router.get("/priority/:priority", getTasksByPriority); // GET /api/tasks/priority/high
router.get("/:id", getTaskById); // GET /api/tasks/:id

// POST routes
router.post("/", createTask); // POST /api/tasks
router.post("/:id/subtasks", addSubtask); // POST /api/tasks/:id/subtasks

// PUT routes
router.put("/:id", updateTask); // PUT /api/tasks/:id
router.put("/:id/toggle", toggleTaskCompletion); // PUT /api/tasks/:id/toggle
router.put("/:id/subtasks/:subtaskId/toggle", toggleSubtask); // PUT /api/tasks/:id/subtasks/:subtaskId/toggle

// DELETE routes
router.delete("/:id", deleteTask); // DELETE /api/tasks/:id

module.exports = router;
