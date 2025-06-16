const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      "Venue",
      "Catering",
      "Decor",
      "Entertainment",
      "Photography",
      "Attire",
      "Transportation",
      "Gifts",
      "Other",
    ],
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  estimatedCost: {
    type: Number,
    required: true,
    min: 0,
  },
  actualCost: {
    type: Number,
    default: 0,
    min: 0,
  },
  notes: {
    type: String,
    trim: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
budgetSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Budget = mongoose.model("Budget", budgetSchema);

module.exports = Budget;
