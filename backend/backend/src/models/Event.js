const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
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
    eventDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: false,
    },
    location: {
      type: String,
      required: true,
    },
    dressCode: {
      type: String,
      required: false,
    },
    menu: [String],
    additionalDetails: {
      type: String,
      required: false,
    },
    category: {
      type: String,
      enum: [
        "milestone",
        "meeting",
        "celebration",
        "deadline",
        "workshop",
        "other",
      ],
      default: "other",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    organizer: {
      type: String,
      required: true,
    },
    attendees: [
      {
        name: String,
        email: String,
        role: String,
      },
    ],
    status: {
      type: String,
      enum: ["draft", "published", "cancelled", "completed"],
      default: "draft",
    },
    maxAttendees: {
      type: Number,
      default: null,
    },
    registrationRequired: {
      type: Boolean,
      default: false,
    },
    tags: [String],
    notes: String,
    reminders: [
      {
        type: String,
        time: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
eventSchema.index({ eventDate: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ status: 1 });

module.exports = mongoose.model("Event", eventSchema);
