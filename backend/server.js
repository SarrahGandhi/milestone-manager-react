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
  process.env.NODE_ENV === "production"
    ? "mongodb+srv://admin:admin@cluster0.6brfp.mongodb.net/WeddingData"
    : "mongodb://localhost:27017/WeddingData"; // Use local MongoDB for development

// MongoDB connection options
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // 30 seconds
  socketTimeoutMS: 45000, // 45 seconds
  bufferMaxEntries: 0,
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  retryWrites: true,
  w: "majority",
};

mongoose
  .connect(MONGODB_URI, mongooseOptions)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Handle MongoDB connection events
mongoose.connection.on("connected", () => {
  console.log("✅ Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ Mongoose disconnected");
});

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
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);

  if (error.name === "MongooseError" || error.name === "MongoError") {
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
