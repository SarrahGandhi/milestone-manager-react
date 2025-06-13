const mongoose = require("mongoose");

const guestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: false,
      trim: true,
    },
    address: {
      type: String,
      required: false,
      trim: true,
    },
    city: {
      type: String,
      required: false,
      trim: true,
    },
    country: {
      type: String,
      required: false,
      trim: true,
      default: "US",
    },
    selectedEvents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    eventAttendees: {
      type: Object,
      default: {},
      validate: {
        validator: function (value) {
          // Check if each event's attendee count has the correct structure
          for (const eventId in value) {
            const counts = value[eventId];
            if (!counts || typeof counts !== "object") return false;
            if (
              !("men" in counts) ||
              !("women" in counts) ||
              !("kids" in counts)
            )
              return false;
            if (
              typeof counts.men !== "number" ||
              typeof counts.women !== "number" ||
              typeof counts.kids !== "number"
            )
              return false;
          }
          return true;
        },
        message:
          "Event attendees must have men, women, and kids counts as numbers",
      },
    },
    notes: {
      type: String,
      required: false,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add virtual for total attendees
guestSchema.virtual("totalAttendees").get(function () {
  let total = 0;
  if (this.eventAttendees) {
    for (const eventId in this.eventAttendees) {
      const counts = this.eventAttendees[eventId];
      total += (counts.men || 0) + (counts.women || 0) + (counts.kids || 0);
    }
  }
  return total;
});

// Add indexes for better query performance
guestSchema.index({ userId: 1 });
guestSchema.index({ name: 1 });
guestSchema.index({ category: 1 });

module.exports = mongoose.model("Guest", guestSchema);
