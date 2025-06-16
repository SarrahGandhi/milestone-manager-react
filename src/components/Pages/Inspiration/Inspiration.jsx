import React, { useState, useEffect } from "react";
import "./Inspiration.css";
import {
  uploadInspirationImage,
  getInspirationImages,
  deleteInspirationImage,
} from "../../../services/inspirationService";

const inspirationGallery = [
  {
    id: 1,
    imageUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed",
    title: "Elegant Wedding Dress",
    category: "Dresses",
  },
  {
    id: 2,
    imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc",
    title: "Romantic Table Setting",
    category: "Decor",
  },
  {
    id: 3,
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552",
    title: "Beautiful Bouquet",
    category: "Flowers",
  },
  {
    id: 4,
    imageUrl: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6",
    title: "Wedding Cake Design",
    category: "Cakes",
  },
  {
    id: 5,
    imageUrl: "https://images.unsplash.com/photo-1510076857177-7470076d4098",
    title: "Outdoor Venue",
    category: "Venues",
  },
  {
    id: 6,
    imageUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3",
    title: "Wedding Ring",
    category: "Jewelry",
  },
  {
    id: 7,
    imageUrl: "https://images.unsplash.com/photo-1475189778702-5ec9941484ae",
    title: "Wedding Invitation",
    category: "Stationery",
  },
  {
    id: 8,
    imageUrl: "https://images.unsplash.com/photo-1482575832494-771f74bf6857",
    title: "Wedding Photography",
    category: "Photography",
  },
  {
    id: 9,
    imageUrl: "https://images.unsplash.com/photo-1517722014278-c256a91a6fba",
    title: "Bridal Accessories",
    category: "Accessories",
  },
];

const categories = [
  ...new Set(inspirationGallery.map((item) => item.category)),
];

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  imageTitle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Delete Image</h2>
        <p className="delete-confirmation-text">
          Are you sure you want to delete "{imageTitle}"? This action cannot be
          undone.
        </p>
        <div className="modal-actions">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="btn-danger">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const UploadModal = ({ isOpen, onClose, onUpload }) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFile && title && category) {
      try {
        const formData = new FormData();
        formData.append("image", selectedFile);
        formData.append("title", title);
        formData.append("category", category);

        await onUpload(formData);
        setTitle("");
        setCategory("");
        setSelectedFile(null);
        setPreviewUrl(null);
        setError("");
        onClose();
      } catch (error) {
        setError("Failed to upload image. Please try again.");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Upload Inspiration Image</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter image title"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="new">+ Add New Category</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="image">Image</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
            {previewUrl && (
              <div className="image-preview">
                <img src={previewUrl} alt="Preview" />
              </div>
            )}
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Inspiration = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [hoveredImage, setHoveredImage] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [gallery, setGallery] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    imageId: null,
    imageTitle: "",
  });

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      const images = await getInspirationImages();
      setGallery(images);

      // Extract unique categories from the images
      const uniqueCategories = [...new Set(images.map((img) => img.category))];
      setCategories(uniqueCategories);

      setError("");
    } catch (error) {
      setError("Failed to load images. Please try again later.");
      console.error("Error fetching images:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredGallery =
    selectedCategory === "All"
      ? gallery
      : gallery.filter((item) => item.category === selectedCategory);

  const handleUpload = async (formData) => {
    try {
      await uploadInspirationImage(formData);
      await fetchImages(); // Refresh the gallery
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleDeleteClick = (e, image) => {
    e.stopPropagation();
    setDeleteConfirmation({
      isOpen: true,
      imageId: image._id,
      imageTitle: image.title,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteInspirationImage(deleteConfirmation.imageId);
      await fetchImages(); // Refresh the gallery
      setDeleteConfirmation({
        isOpen: false,
        imageId: null,
        imageTitle: "",
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      setError("Failed to delete image. Please try again.");
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="inspiration-container">
      <div className="inspiration-header">
        <div className="header-content">
          <h1>Wedding Inspiration Gallery</h1>
          <p>Discover ideas and inspiration for your perfect wedding</p>
        </div>
        <button
          className="upload-btn"
          onClick={() => setIsUploadModalOpen(true)}
        >
          Upload Image
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="category-filter">
        <button
          className={`category-btn ${
            selectedCategory === "All" ? "active" : ""
          }`}
          onClick={() => setSelectedCategory("All")}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category}
            className={`category-btn ${
              selectedCategory === category ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="inspiration-gallery">
        {filteredGallery.map((image) => (
          <div
            key={image._id}
            className="gallery-item"
            onMouseEnter={() => setHoveredImage(image._id)}
            onMouseLeave={() => setHoveredImage(null)}
          >
            <img src={image.imageUrl} alt={image.title} />
            <div
              className={`item-overlay ${
                hoveredImage === image._id ? "visible" : ""
              }`}
            >
              <div className="item-overlay-content">
                <div className="item-info">
                  <h3>{image.title}</h3>
                  <span className="category-tag">{image.category}</span>
                </div>
                <button
                  className="delete-btn"
                  onClick={(e) => handleDeleteClick(e, image)}
                  aria-label="Delete image"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"></path>
                    <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />

      <DeleteConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() =>
          setDeleteConfirmation({
            isOpen: false,
            imageId: null,
            imageTitle: "",
          })
        }
        onConfirm={handleDeleteConfirm}
        imageTitle={deleteConfirmation.imageTitle}
      />
    </div>
  );
};

export default Inspiration;
