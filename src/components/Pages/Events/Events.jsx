import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../Header/Header";
import Footer from "../../Footer/Footer";
import "./Events.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faCalendarAlt,
  faClock,
  faMapMarkerAlt,
  faPalette,
  faEdit,
  faTrash,
  faEye,
} from "@fortawesome/free-solid-svg-icons";

const Events = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Enhanced sample events data with additional details
  const [events] = useState([
    {
      id: 1,
      title: "Bridal Shower",
      date: "7th October, 2026",
      time: "7:00 PM | Tuesday",
      location: "Villa Vayu",
      theme: "Pink and Purple",
      numberOfGuests: 25,
      dressCode: "Cocktail Attire - Pink/Purple Theme",
      menu: [
        "Welcome Cocktails",
        "Canapés & Finger Foods",
        "Bridal Shower Cake",
        "Champagne Toast",
        "Tea & Coffee Service",
      ],
      additionalNotes:
        "Please bring a gift for the bride. Photography will be arranged. Parking available on-site.",
    },
    {
      id: 2,
      title: "Wedding Ceremony",
      date: "8th October, 2026",
      time: "4:00 PM | Wednesday",
      location: "Grand Ballroom",
      theme: "White and Gold",
      numberOfGuests: 150,
      dressCode: "Formal Attire - No White (Reserved for Bride)",
      menu: [
        "Pre-ceremony Refreshments",
        "Wedding Cake",
        "Champagne Reception",
        "Light Appetizers",
      ],
      additionalNotes:
        "Ceremony will be followed by cocktail hour. Please arrive 30 minutes early for seating. Professional photographer will be present.",
    },
    {
      id: 3,
      title: "Reception Party",
      date: "8th October, 2026",
      time: "7:00 PM | Wednesday",
      location: "Garden Pavilion",
      theme: "Silver and Blue",
      numberOfGuests: 200,
      dressCode: "Semi-Formal to Formal",
      menu: [
        "Three-Course Dinner",
        "Open Bar",
        "Wedding Cake Cutting",
        "Late Night Snacks",
        "Coffee & Dessert Station",
      ],
      additionalNotes:
        "Dancing and live music entertainment. Outdoor venue with backup indoor option in case of weather. Shuttle service provided from ceremony venue.",
    },
    {
      id: 4,
      title: "Honeymoon Planning",
      date: "9th October, 2026",
      time: "10:00 AM | Thursday",
      location: "Travel Agency",
      theme: "Tropical",
      numberOfGuests: 2,
      dressCode: "Casual",
      menu: ["Coffee & Pastries", "Light Refreshments"],
      additionalNotes:
        "Bring passports and travel preferences. Meeting to finalize honeymoon destination and bookings.",
    },
  ]);

  // Filter events based on search query
  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.theme.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="events-root">
        <div className="events-header-row">
          <button className="add-task-btn">
            <FontAwesomeIcon icon={faPlus} />
            Add New Task
          </button>
          <input
            type="text"
            placeholder="Search events..."
            className="events-search-bar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="events-card-row">
          {filteredEvents.map((event) => (
            <div key={event.id} className="event-card">
              <h2 className="event-title">{event.title}</h2>
              <div className="event-info">
                <FontAwesomeIcon icon={faCalendarAlt} />
                {event.date}
              </div>
              <div className="event-info">
                <FontAwesomeIcon icon={faClock} />
                {event.time}
              </div>
              <div className="event-info">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                {event.location}
              </div>
              <div className="event-info">
                <FontAwesomeIcon icon={faPalette} />
                {event.theme}
              </div>
              <button
                className="event-view-btn"
                onClick={() => navigate(`/events/${event.id}`)}
              >
                View Details
              </button>
              <div className="event-card-btn-row">
                <button className="event-edit-btn">
                  <FontAwesomeIcon icon={faEdit} /> Edit
                </button>
                <button className="event-delete-btn">
                  <FontAwesomeIcon icon={faTrash} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Events;
