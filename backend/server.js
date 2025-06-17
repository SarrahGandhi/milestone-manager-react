const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Set JWT_SECRET if not provided in environment
process.env.JWT_SECRET =
  process.env.JWT_SECRET ||
  "milestone_manager_super_secret_key_2024_wedding_planning_app";

// Improved CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      "https://milestone-manager-react.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json());

// Add request logging for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// MongoDB Atlas Connection
const MONGODB_URI =
  "mongodb+srv://admin:admin@cluster0.6brfp.mongodb.net/WeddingData";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Import routes
const authRoutes = require("./src/routes/authRoutes");
const eventRoutes = require("./src/routes/eventRoutes");
const taskRoutes = require("./src/routes/taskRoutes");
const guestRoutes = require("./src/routes/guestRoutes");
const budgetRoutes = require("./src/routes/budgetRoutes");

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/guests", guestRoutes);
app.use("/api/budget", budgetRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Milestone Manager API" });
});

// TEMPORARY DEBUG ROUTE - bypasses all auth
app.get("/api/debug/tasks", async (req, res) => {
  try {
    const Task = require("./src/models/Task");
    const allTasks = await Task.find({});
    console.log("🔍 DEBUG: Found", allTasks.length, "tasks in database");
    console.log(
      "🔍 DEBUG: Task details:",
      allTasks.map((t) => ({
        id: t._id,
        title: t.title,
        category: t.category,
        priority: t.priority,
        completed: t.completed,
        userId: t.userId,
        dueDate: t.dueDate,
      }))
    );
    res.json({
      count: allTasks.length,
      tasks: allTasks,
    });
  } catch (error) {
    console.error("🚨 DEBUG route error:", error);
    res.status(500).json({ error: error.message });
  }
});

// TEMPORARY DEBUG ROUTE - see users
app.get("/api/debug/users", async (req, res) => {
  try {
    const User = require("./src/models/User");
    const allUsers = await User.find({}, { password: 0 }); // Exclude passwords
    console.log("🔍 DEBUG: Found", allUsers.length, "users in database");
    console.log(
      "🔍 DEBUG: Users:",
      allUsers.map((u) => ({
        id: u._id,
        email: u.email,
        name: u.name,
      }))
    );
    res.json({
      count: allUsers.length,
      users: allUsers,
    });
  } catch (error) {
    console.error("🚨 DEBUG route error:", error);
    res.status(500).json({ error: error.message });
  }
});

// TEMPORARY DEBUG ROUTE - fix orphaned tasks
app.post("/api/debug/fix-tasks", async (req, res) => {
  try {
    const Task = require("./src/models/Task");
    const userId = "684b0412491a81292f6cb8e9"; // Your user ID

    // Find tasks without userId
    const orphanedTasks = await Task.find({ userId: { $exists: false } });
    console.log("🔧 Found", orphanedTasks.length, "orphaned tasks to fix");

    // Update orphaned tasks to belong to you
    const result = await Task.updateMany(
      { userId: { $exists: false } },
      {
        $set: {
          userId: userId,
          createdBy: userId,
        },
      }
    );

    console.log("✅ Fixed", result.modifiedCount, "orphaned tasks");

    // Get all tasks after fix
    const allTasks = await Task.find({ userId });

    res.json({
      message: "Tasks fixed!",
      orphanedTasksFixed: result.modifiedCount,
      totalTasksForUser: allTasks.length,
      tasks: allTasks,
    });
  } catch (error) {
    console.error("🚨 Fix tasks error:", error);
    res.status(500).json({ error: error.message });
  }
});

// TEMPORARY DEBUG ROUTE - check guest events
app.get("/api/debug/guest-events", async (req, res) => {
  try {
    const GuestEvent = require("./src/models/GuestEvent");
    const allGuestEvents = await GuestEvent.find({})
      .populate("guestId", "name")
      .populate("eventId", "title");

    console.log(
      "🔍 DEBUG: Found",
      allGuestEvents.length,
      "guest events in database"
    );
    console.log("🔍 DEBUG: Guest events:", allGuestEvents);

    res.json({
      count: allGuestEvents.length,
      guestEvents: allGuestEvents,
    });
  } catch (error) {
    console.error("🚨 DEBUG guest events error:", error);
    res.status(500).json({ error: error.message });
  }
});

// TEMPORARY DEBUG ROUTE - check budgets
app.get("/api/debug/budgets", async (req, res) => {
  try {
    const Budget = require("./src/models/Budget");
    const allBudgets = await Budget.find({});
    console.log("🔍 DEBUG: Found", allBudgets.length, "budgets in database");
    console.log("🔍 DEBUG: Budget details:", allBudgets);
    res.json({
      count: allBudgets.length,
      budgets: allBudgets,
    });
  } catch (error) {
    console.error("🚨 DEBUG budgets error:", error);
    res.status(500).json({ error: error.message });
  }
});

// TEMPORARY DEBUG ROUTE - check events
app.get("/api/debug/events", async (req, res) => {
  try {
    const Event = require("./src/models/Event");
    const allEvents = await Event.find({});
    console.log("🔍 DEBUG: Found", allEvents.length, "events in database");
    console.log("🔍 DEBUG: Events:", allEvents);
    res.json({
      count: allEvents.length,
      events: allEvents,
    });
  } catch (error) {
    console.error("🚨 DEBUG events error:", error);
    res.status(500).json({ error: error.message });
  }
});

// TEMPORARY DEBUG ROUTE - publish all events
app.post("/api/debug/publish-events", async (req, res) => {
  try {
    const Event = require("./src/models/Event");
    const result = await Event.updateMany({}, { status: "published" });

    // Get all events after update
    const allEvents = await Event.find({});

    console.log("🔍 DEBUG: Published", result.modifiedCount, "events");
    console.log("🔍 DEBUG: Updated events:", allEvents);

    res.json({
      message: "Events published!",
      eventsUpdated: result.modifiedCount,
      totalEvents: allEvents.length,
      events: allEvents,
    });
  } catch (error) {
    console.error("🚨 DEBUG publish events error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    jwtSecret: process.env.JWT_SECRET ? "Set" : "Not Set",
  });
});

// Debug auth route
app.get("/api/debug/auth", (req, res) => {
  res.json({
    message: "Auth endpoint accessible",
    timestamp: new Date().toISOString(),
    jwtSecret: process.env.JWT_SECRET ? "Set" : "Not Set",
    endpoints: [
      "POST /api/auth/login",
      "POST /api/auth/register",
      "GET /api/auth/me",
    ],
  });
});

// Test login endpoint
app.post("/api/debug/test-login", async (req, res) => {
  try {
    console.log("🔍 Test login received:", req.body);
    res.json({
      success: true,
      message: "Test endpoint working",
      received: req.body,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("🚨 Test login error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack,
    });
  }
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌐 Frontend should be on http://localhost:5174`);
  console.log(`📡 API available at http://localhost:${PORT}`);
});
