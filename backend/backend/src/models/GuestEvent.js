const mongoose = require("mongoose");

const guestEventSchema = new mongoose.Schema(
  {
    guestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guest",
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    invitationStatus: {
      type: String,
      enum: ["not_sent", "sent", "delivered", "opened"],
      default: "not_sent",
    },
    rsvpStatus: {
      type: String,
      enum: ["pending", "confirmed", "declined", "maybe"],
      default: "pending",
    },
    rsvpDate: {
      type: Date,
      required: false,
    },
    attendeeCount: {
      type: Number,
      default: 1,
      min: 0,
    },
    mealChoice: {
      type: String,
      required: false,
    },
    specialRequests: {
      type: String,
      required: false,
    },
    plusOne: {
      name: {
        type: String,
        required: false,
      },
      dietaryRestrictions: {
        type: String,
        required: false,
      },
    },
    notes: {
      type: String,
      required: false,
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

// Create compound index to ensure unique guest-event pairs
guestEventSchema.index({ guestId: 1, eventId: 1 }, { unique: true });
guestEventSchema.index({ userId: 1 });
guestEventSchema.index({ eventId: 1 });
guestEventSchema.index({ rsvpStatus: 1 });

module.exports = mongoose.model("GuestEvent", guestEventSchema);
