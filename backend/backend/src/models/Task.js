const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    category: {
      type: String,
      enum: ["Budget", "Venue", "Vendors", "Planning", "Other"],
      default: "Other",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    completed: {
      type: Boolean,
      default: false,
    },
    assignedTo: {
      type: String,
      required: false,
    },
    estimatedTime: {
      type: Number, // in hours
      required: false,
    },
    actualTime: {
      type: Number, // in hours
      required: false,
    },
    notes: {
      type: String,
      required: false,
    },
    tags: [String],
    subtasks: [
      {
        title: String,
        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],
    completedAt: {
      type: Date,
      required: false,
    },
    reminders: [
      {
        date: Date,
        message: String,
      },
    ],
    relatedEvent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
taskSchema.index({ dueDate: 1 });
taskSchema.index({ category: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ completed: 1 });
taskSchema.index({ assignedTo: 1 });

// Virtual for determining if task is overdue
taskSchema.virtual("isOverdue").get(function () {
  return !this.completed && this.dueDate < new Date();
});

// Pre-save middleware to set completedAt date
taskSchema.pre("save", function (next) {
  if (this.isModified("completed")) {
    if (this.completed && !this.completedAt) {
      this.completedAt = new Date();
    } else if (!this.completed) {
      this.completedAt = undefined;
    }
  }
  next();
});

module.exports = mongoose.model("Task", taskSchema);
