import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../Header/Header";
import Footer from "../../Footer/Footer";
import "./EventDetails.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faClock,
  faMapMarkerAlt,
  faPalette,
  faUsers,
  faUtensils,
  faTshirt,
  faStickyNote,
  faArrowLeft,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  // Enhanced sample events data with additional details
  const events = [
    {
      id: 1,
      title: "Bridal Shower",
      date: "7th October, 2026",
      day: "Tuesday",
      time: "7:00 PM",
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
      day: "Wednesday",
      time: "4:00 PM",
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
      day: "Wednesday",
      time: "7:00 PM",
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
      day: "Thursday",
      time: "10:00 AM",
      location: "Travel Agency",
      theme: "Tropical",
      numberOfGuests: 2,
      dressCode: "Casual",
      menu: ["Coffee & Pastries", "Light Refreshments"],
      additionalNotes:
        "Bring passports and travel preferences. Meeting to finalize honeymoon destination and bookings.",
    },
  ];

  const event = events.find((e) => e.id === parseInt(eventId));

  if (!event) {
    return (
      <div className="event-details-root">
        <div className="event-not-found">
          <h2>Event Not Found</h2>
          <button onClick={() => navigate("/events")} className="back-btn">
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="event-details-root">
        <div className="event-details-header">
          <button onClick={() => navigate("/events")} className="back-btn">
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Events
          </button>
          <button className="edit-event-btn">
            <FontAwesomeIcon icon={faEdit} /> Edit Event
          </button>
        </div>

        <div className="event-details-container">
          <div className="event-details-title">
            <h1>{event.title}</h1>
            <div className="event-theme-badge">
              <FontAwesomeIcon icon={faPalette} />
              {event.theme}
            </div>
          </div>

          <div className="event-details-grid">
            <div className="event-detail-card">
              <div className="detail-header">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <h3>Date & Time</h3>
              </div>
              <div className="detail-content">
                <p>
                  <strong>Date:</strong> {event.date}
                </p>
                <p>
                  <strong>Day:</strong> {event.day}
                </p>
                <p>
                  <strong>Time:</strong> {event.time}
                </p>
              </div>
            </div>

            <div className="event-detail-card">
              <div className="detail-header">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <h3>Location</h3>
              </div>
              <div className="detail-content">
                <p>{event.location}</p>
              </div>
            </div>

            <div className="event-detail-card">
              <div className="detail-header">
                <FontAwesomeIcon icon={faUsers} />
                <h3>Guest Count</h3>
              </div>
              <div className="detail-content">
                <p>
                  <strong>{event.numberOfGuests}</strong> guests expected
                </p>
              </div>
            </div>

            <div className="event-detail-card">
              <div className="detail-header">
                <FontAwesomeIcon icon={faTshirt} />
                <h3>Dress Code</h3>
              </div>
              <div className="detail-content">
                <p>{event.dressCode}</p>
              </div>
            </div>

            <div className="event-detail-card menu-card">
              <div className="detail-header">
                <FontAwesomeIcon icon={faUtensils} />
                <h3>Menu</h3>
              </div>
              <div className="detail-content">
                <ul className="menu-list">
                  {event.menu.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="event-detail-card notes-card">
              <div className="detail-header">
                <FontAwesomeIcon icon={faStickyNote} />
                <h3>Additional Notes</h3>
              </div>
              <div className="detail-content">
                <p>{event.additionalNotes}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventDetails;
