import React from "react";
import "./Inspiration.css";

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

const Inspiration = () => {
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [hoveredImage, setHoveredImage] = React.useState(null);

  const filteredGallery =
    selectedCategory === "All"
      ? inspirationGallery
      : inspirationGallery.filter((item) => item.category === selectedCategory);

  return (
    <div className="inspiration-container">
      <div className="inspiration-header">
        <h1>Wedding Inspiration Gallery</h1>
        <p>Discover ideas and inspiration for your perfect wedding</p>
      </div>

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
        {filteredGallery.map((item) => (
          <div
            key={item.id}
            className="gallery-item"
            onMouseEnter={() => setHoveredImage(item.id)}
            onMouseLeave={() => setHoveredImage(null)}
          >
            <img src={item.imageUrl} alt={item.title} loading="lazy" />
            <div
              className={`item-overlay ${
                hoveredImage === item.id ? "visible" : ""
              }`}
            >
              <h3>{item.title}</h3>
              <span className="category-tag">{item.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inspiration;
