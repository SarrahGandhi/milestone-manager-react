const mongoose = require("mongoose");

const inspirationImageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  // Store the public ID from Cloudinary for easier deletion
  cloudinaryPublicId: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  tags: [
    {
      type: String,
      trim: true,
    },
  ],
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
inspirationImageSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const InspirationImage = mongoose.model(
  "InspirationImage",
  inspirationImageSchema
);

module.exports = InspirationImage;
