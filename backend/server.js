const express = require("express");
const cors = require("cors");
const { testConnection } = require("./src/config/database");
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

// Supabase Database Connection
const initializeDatabase = async () => {
  try {
    const connected = await testConnection();
    if (connected) {
      console.log("✅ Connected to Supabase successfully");
    } else {
      console.error("❌ Failed to connect to Supabase");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Database initialization error:", error);
    process.exit(1);
  }
};

// Initialize database connection
initializeDatabase();

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

// Health check route
app.get("/api/health", async (req, res) => {
  try {
    const dbConnected = await testConnection();
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbConnected ? "Connected" : "Disconnected",
    });
  } catch (error) {
    res.status(503).json({
      status: "Error",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: "Error",
      error: error.message,
    });
  }
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);

  if (error.code && error.code.startsWith("PG")) {
    return res.status(503).json({
      success: false,
      message: "Database connection error. Please try again later.",
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// Handle 404 routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌐 Frontend should be on http://localhost:5174`);
  console.log(`📡 API available at http://localhost:${PORT}`);
});
