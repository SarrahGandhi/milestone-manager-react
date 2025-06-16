const InspirationImage = require("../models/InspirationImage");
const cloudinary = require("cloudinary").v2;
const { validateObjectId } = require("../utils/validation");
const fs = require("fs");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload a new inspiration image
exports.uploadImage = async (req, res) => {
  try {
    console.log("Starting image upload process...");
    console.log("Request body:", req.body);
    console.log("File details:", req.file);

    const { title, category, description, tags } = req.body;
    const imageFile = req.file;

    // Check Cloudinary configuration
    console.log("Cloudinary Config:", {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? "Set" : "Not Set",
      api_key: process.env.CLOUDINARY_API_KEY ? "Set" : "Not Set",
      api_secret: process.env.CLOUDINARY_API_SECRET ? "Set" : "Not Set",
    });

    if (!imageFile) {
      console.log("No image file provided");
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    if (!title || !category) {
      console.log("Missing required fields:", {
        title: !!title,
        category: !!category,
      });
      return res.status(400).json({
        success: false,
        message: "Title and category are required",
      });
    }

    try {
      console.log("Attempting to upload to Cloudinary...");
      console.log("File path:", imageFile.path);

      // Upload image to Cloudinary
      const result = await cloudinary.uploader.upload(imageFile.path, {
        folder: "wedding-inspiration",
        resource_type: "image",
      });

      console.log("Cloudinary upload successful:", result);

      // Create new inspiration image document
      const inspirationImage = new InspirationImage({
        userId: req.user._id,
        title,
        category,
        description: description || "",
        tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
        imageUrl: result.secure_url,
        cloudinaryPublicId: result.public_id,
      });

      console.log("Saving to database:", inspirationImage);
      await inspirationImage.save();
      console.log("Successfully saved to database");

      // Delete the temporary file
      fs.unlink(imageFile.path, (err) => {
        if (err) {
          console.error("Error deleting temporary file:", err);
        } else {
          console.log("Temporary file deleted successfully");
        }
      });

      res.status(201).json({
        success: true,
        message: "Image uploaded successfully",
        image: inspirationImage,
      });
    } catch (uploadError) {
      console.error("Error during upload process:", uploadError);

      // Delete the temporary file in case of error
      fs.unlink(imageFile.path, (err) => {
        if (err) console.error("Error deleting temporary file:", err);
      });
      throw uploadError;
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error uploading image",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Get all inspiration images for a user
exports.getImages = async (req, res) => {
  try {
    const images = await InspirationImage.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      images,
    });
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching images",
    });
  }
};

// Get images by category
exports.getImagesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const images = await InspirationImage.find({
      userId: req.user._id,
      category,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      images,
    });
  } catch (error) {
    console.error("Error fetching images by category:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching images by category",
    });
  }
};

// Delete an inspiration image
exports.deleteImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    if (!validateObjectId(imageId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid image ID",
      });
    }

    const image = await InspirationImage.findOne({
      _id: imageId,
      userId: req.user._id,
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    // Delete image from Cloudinary
    await cloudinary.uploader.destroy(image.cloudinaryPublicId);

    // Delete image document from database
    await image.deleteOne();

    res.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting image",
    });
  }
};

// Update image details
exports.updateImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const { title, category, description, tags } = req.body;

    if (!validateObjectId(imageId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid image ID",
      });
    }

    const image = await InspirationImage.findOne({
      _id: imageId,
      userId: req.user._id,
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    // Update fields
    if (title) image.title = title;
    if (category) image.category = category;
    if (description) image.description = description;
    if (tags) image.tags = tags.split(",").map((tag) => tag.trim());

    await image.save();

    res.json({
      success: true,
      message: "Image updated successfully",
      image,
    });
  } catch (error) {
    console.error("Error updating image:", error);
    res.status(500).json({
      success: false,
      message: "Error updating image",
    });
  }
};
