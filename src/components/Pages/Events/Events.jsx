import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Events.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faClock,
  faMapMarkerAlt,
  faPalette,
} from "@fortawesome/free-solid-svg-icons";

const Events = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSide, setActiveSide] = useState("Bride");
  const navigate = useNavigate();

  // Hardcoded events data
  const events = [
    {
      id: 1,
      title: "Engagement Party",
      eventDate: "2025-06-15",
      startTime: "18:00",
      location: "Grand Ballroom, City Center",
      dressCode: "Cocktail Attire",
      category: "Pre-Wedding",
      side: "Both",
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
    },
  ];

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

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.dressCode &&
        event.dressCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (event.category &&
        event.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSide = event.side === "Both" || event.side === activeSide;

    return matchesSearch && matchesSide;
  });

  return (
    <div className="events-root">
      <div className="events-header-row">
        <div className="events-filter-toggle">
          <button
            className={`toggle-btn ${activeSide === "Bride" ? "active" : ""}`}
            onClick={() => setActiveSide("Bride")}
          >
            Bride
          </button>
          <button
            className={`toggle-btn ${activeSide === "Groom" ? "active" : ""}`}
            onClick={() => setActiveSide("Groom")}
          >
            Groom
          </button>
        </div>
        <input
          type="text"
          placeholder="Search events..."
          className="events-search-bar"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredEvents.length === 0 ? (
        <div className="no-events-message">
          {searchQuery
            ? "No events match your search."
            : `No events for ${activeSide}.`}
        </div>
      ) : (
        <div className="events-card-row">
          {filteredEvents.map((event) => (
            <div key={event.id} className="event-card">
              <h2 className="event-title">{event.title}</h2>
              <div className="event-info">
                <FontAwesomeIcon icon={faCalendarAlt} />
                {formatDate(event.eventDate)}
              </div>
              <div className="event-info">
                <FontAwesomeIcon icon={faClock} />
                {formatTime(event.startTime)}
              </div>
              <div className="event-info">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                {event.location}
              </div>
              {event.dressCode && (
                <div className="event-info">
                  <FontAwesomeIcon icon={faPalette} />
                  {event.dressCode}
                </div>
              )}
              <div className="event-btn-row">
                <button
                  className="event-view-btn"
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  View Details
                </button>
                <button
                  className="event-rsvp-btn"
                  onClick={() => navigate(`/rsvp-manager?event=${event.id}`)}
                  title="Manage RSVPs for this event"
                >
                  View RSVPs
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;
