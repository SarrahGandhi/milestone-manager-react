const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { authenticateToken } = require("../middleware/auth");
const {
  uploadImage,
  getImages,
  getImagesByCategory,
  deleteImage,
  updateImage,
} = require("../controllers/inspirationController");

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Ensure uploads directory exists
const fs = require("fs");
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Routes
router.post("/upload", authenticateToken, upload.single("image"), uploadImage);
router.get("/", authenticateToken, getImages);
router.get("/category/:category", authenticateToken, getImagesByCategory);
router.delete("/:imageId", authenticateToken, deleteImage);
router.put("/:imageId", authenticateToken, updateImage);

module.exports = router;
