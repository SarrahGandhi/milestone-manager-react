const mongoose = require("mongoose");
const Task = require("../models/Task");
require("dotenv").config({ path: "../../../../backend/.env" });

const seedTasks = [
  {
    title: "Research and estimate costs for major budget items",
    description:
      "Create detailed budget breakdown for venue, catering, and decorations",
    dueDate: new Date("2025-06-15"),
    category: "Budget",
    priority: "high",
    completed: false,
    estimatedTime: 4,
    tags: ["budget", "planning", "research"],
  },
  {
    title: "Book Wedding Venue",
    description: "Finalize venue booking and sign contract",
    dueDate: new Date("2025-07-15"),
    category: "Venue",
    priority: "high",
    completed: false,
    estimatedTime: 6,
    tags: ["venue", "booking", "contract"],
  },
  {
    title: "Order Rentals",
    description: "Order tables, chairs, linens, and other rental items",
    dueDate: new Date("2025-08-15"),
    category: "Vendors",
    priority: "medium",
    completed: false,
    estimatedTime: 3,
    tags: ["rentals", "vendors", "equipment"],
  },
  {
    title: "Explore and tour Venues",
    description: "Visit potential venues and compare options",
    dueDate: new Date("2025-11-15"),
    category: "Venue",
    priority: "medium",
    completed: false,
    estimatedTime: 8,
    tags: ["venue", "tours", "research"],
  },
  {
    title: "Book Engagement Venue",
    description: "Secure venue for engagement party",
    dueDate: new Date("2025-10-15"),
    category: "Venue",
    priority: "low",
    completed: false,
    estimatedTime: 2,
    tags: ["engagement", "venue", "party"],
  },
  {
    title: "Create Guest List",
    description: "Compile comprehensive list of wedding guests",
    dueDate: new Date("2025-06-30"),
    category: "Planning",
    priority: "high",
    completed: false,
    estimatedTime: 3,
    tags: ["guests", "planning", "invitations"],
  },
  {
    title: "Order Wedding Invitations",
    description: "Design and order wedding invitations",
    dueDate: new Date("2025-07-30"),
    category: "Planning",
    priority: "medium",
    completed: false,
    estimatedTime: 2,
    tags: ["invitations", "design", "printing"],
  },
  {
    title: "Book Photographer",
    description: "Find and book wedding photographer",
    dueDate: new Date("2025-08-01"),
    category: "Vendors",
    priority: "high",
    completed: false,
    estimatedTime: 5,
    tags: ["photographer", "vendors", "booking"],
  },
];

async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing tasks
    console.log("Clearing existing tasks...");
    await Task.deleteMany({});

    // Insert seed tasks
    console.log("Inserting seed tasks...");
    const createdTasks = await Task.insertMany(seedTasks);
    console.log(`Successfully created ${createdTasks.length} tasks`);

    // Display created tasks
    createdTasks.forEach((task, index) => {
      console.log(
        `${index + 1}. ${task.title} (${task.category}, ${
          task.priority
        } priority)`
      );
    });

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

// Run the seed function
seedDatabase();
