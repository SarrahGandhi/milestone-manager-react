import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
} from "@fortawesome/free-solid-svg-icons";

// Hardcoded events data (matching Events.jsx)
const EVENTS_DATA = [
  {
    id: 1,
    title: "Engagement Party",
    eventDate: "2025-06-15",
    startTime: "18:00",
    location: "Grand Ballroom, City Center",
    dressCode: "Cocktail Attire",
    category: "Pre-Wedding",
    side: "Both",
    description: "Join us as we celebrate our engagement with an evening of drinks, dancing, and delight.",
    maxAttendees: 150,
    menu: ["Signature Cocktails", "Hors d'oeuvres", "Gourmet Buffet", "Dessert Bar"],
  },
  {
    id: 2,
    title: "Sangeet Night",
    eventDate: "2025-12-18",
    startTime: "19:00",
    location: "Royal Gardens",
    dressCode: "Traditional / Indo-Western",
    category: "Pre-Wedding",
    side: "Both",
    description: "A night of music and dance to kick off the wedding festivities.",
    maxAttendees: 200,
    menu: ["Chaat Counter", "Indian Buffet", "Live Jalebi Station"],
  },
  {
    id: 3,
    title: "Haldi Ceremony",
    eventDate: "2025-12-19",
    startTime: "10:00",
    location: "Bride's Residence",
    dressCode: "Yellow Traditional",
    category: "Pre-Wedding",
    side: "Bride",
    description: "Traditional Haldi ceremony with close family and friends.",
    maxAttendees: 50,
    menu: ["Traditional Lunch", "Thandai"],
  },
  {
    id: 4,
    title: "Wedding Ceremony",
    eventDate: "2025-12-20",
    startTime: "11:00",
    location: "Sunset Beach Resort",
    dressCode: "Formal",
    category: "Wedding",
    side: "Both",
    description: "The big moment! We tie the knot by the sea.",
    maxAttendees: 250,
    menu: ["Welcome Drinks", "Seated Lunch", "Wedding Cake"],
  },
  {
    id: 5,
    title: "Reception",
    eventDate: "2025-12-20",
    startTime: "20:00",
    location: "Crystal Banquet Hall",
    dressCode: "Black Tie",
    category: "Wedding",
    side: "Both",
    description: "Celebrate our marriage with a formal reception.",
    maxAttendees: 300,
    menu: ["International Buffet", "Carving Station", "Dessert Table"],
  },
];

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Simulate fetching data
    setLoading(true);
    const foundEvent = EVENTS_DATA.find((e) => e.id === parseInt(eventId));

    if (foundEvent) {
      setEvent(foundEvent);
      setError("");
    } else {
      setError("Event not found");
    }
    setLoading(false);
  }, [eventId]);

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Helper function to get day of week
  const getDayOfWeek = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  // Helper function to format time
  const formatTime = (timeString) => {
    if (!timeString) return "";
    if (timeString.includes("AM") || timeString.includes("PM")) {
      return timeString;
    }
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="event-details-root">
        <div className="loading-message">Loading event details...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-details-root">
        <div className="event-not-found">
          <h2>{error || "Event Not Found"}</h2>
          <button onClick={() => navigate("/events")} className="back-btn">
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="event-details-root">
      <div className="event-details-header">
        <button onClick={() => navigate("/events")} className="back-btn">
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Events
        </button>
      </div>

      <div className="event-details-container">
        <div className="event-details-title">
          <h1>{event.title}</h1>
          {event.dressCode && (
            <div className="event-theme-badge">
              <FontAwesomeIcon icon={faPalette} />
              {event.dressCode}
            </div>
          )}
        </div>

        <div className="event-details-grid">
          <div className="event-detail-card">
            <div className="detail-header">
              <FontAwesomeIcon icon={faCalendarAlt} />
              <h3>Date & Time</h3>
            </div>
            <div className="detail-content">
              <p>
                <strong>Date:</strong> {formatDate(event.eventDate)}
              </p>
              <p>
                <strong>Day:</strong> {getDayOfWeek(event.eventDate)}
              </p>
              <p>
                <strong>Time:</strong> {formatTime(event.startTime)}
              </p>
              {event.endTime && (
                <p>
                  <strong>End Time:</strong> {formatTime(event.endTime)}
                </p>
              )}
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

          {event.maxAttendees && (
            <div className="event-detail-card">
              <div className="detail-header">
                <FontAwesomeIcon icon={faUsers} />
                <h3>Guest Capacity</h3>
              </div>
              <div className="detail-content">
                <p>
                  <strong>{event.maxAttendees}</strong> maximum guests
                </p>
              </div>
            </div>
          )}

          {event.dressCode && (
            <div className="event-detail-card">
              <div className="detail-header">
                <FontAwesomeIcon icon={faTshirt} />
                <h3>Dress Code</h3>
              </div>
              <div className="detail-content">
                <p>{event.dressCode}</p>
              </div>
            </div>
          )}

          {event.menu && event.menu.length > 0 && (
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
          )}

          {(event.additionalDetails || event.description) && (
            <div className="event-detail-card notes-card">
              <div className="detail-header">
                <FontAwesomeIcon icon={faStickyNote} />
                <h3>Additional Details</h3>
              </div>
              <div className="detail-content">
                <p>{event.additionalDetails || event.description}</p>
              </div>
            </div>
          )}

          {event.category && (
            <div className="event-detail-card">
              <div className="detail-header">
                <FontAwesomeIcon icon={faPalette} />
                <h3>Category</h3>
              </div>
              <div className="detail-content">
                <p style={{ textTransform: "capitalize" }}>
                  {event.category}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
