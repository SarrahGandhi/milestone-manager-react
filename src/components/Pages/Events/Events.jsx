import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../Header/Header";
import Footer from "../../Footer/Footer";
import DeleteEventModal from "./DeleteEventModal";
import AuthService from "../../../services/authService";
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
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    eventId: null,
    eventName: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  // Fetch events from the database
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5001/api/events", {
        headers: AuthService.getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data);
        setError("");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to fetch events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  // Load events when component mounts
  useEffect(() => {
    fetchEvents();
  }, []);

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Helper function to format time
  const formatTime = (timeString) => {
    if (!timeString) return "";

    // If it's already in 12-hour format, return as is
    if (timeString.includes("AM") || timeString.includes("PM")) {
      return timeString;
    }

    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Delete event function
  const handleDeleteEvent = async (eventId, eventName) => {
    setDeleteModal({
      isOpen: true,
      eventId,
      eventName,
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.eventId) return;

    try {
      setIsDeleting(true);
      const response = await fetch(
        `http://localhost:5001/api/events/${deleteModal.eventId}`,
        {
          method: "DELETE",
          headers: AuthService.getAuthHeaders(),
        }
      );

      if (response.ok) {
        // Refresh the events list after successful deletion
        fetchEvents();
        setDeleteModal({ isOpen: false, eventId: null, eventName: "" });
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Error deleting event");
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDeleteModal = () => {
    if (!isDeleting) {
      setDeleteModal({ isOpen: false, eventId: null, eventName: "" });
    }
  };

  // Filter events based on search query
  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.dressCode &&
        event.dressCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (event.category &&
        event.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <>
        <div className="events-root">
          <div className="loading-message">Loading events...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="events-root">
          <div className="error-message">
            {error}
            <button onClick={fetchEvents} className="retry-btn">
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="events-root">
        <div className="events-header-row">
          <button
            className="add-task-btn"
            onClick={() => navigate("/events/add")}
          >
            <FontAwesomeIcon icon={faPlus} />
            Add New Event
          </button>
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
              : "No events yet. Create your first event!"}
          </div>
        ) : (
          <div className="events-card-row">
            {filteredEvents.map((event) => (
              <div key={event._id} className="event-card">
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
                <button
                  className="event-view-btn"
                  onClick={() => navigate(`/events/${event._id}`)}
                >
                  View Details
                </button>
                <div className="event-card-btn-row">
                  <button
                    className="event-edit-btn"
                    onClick={() => navigate(`/events/edit/${event._id}`)}
                  >
                    <FontAwesomeIcon icon={faEdit} /> Edit
                  </button>
                  <button
                    className="event-delete-btn"
                    onClick={() => handleDeleteEvent(event._id, event.title)}
                  >
                    <FontAwesomeIcon icon={faTrash} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DeleteEventModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        eventName={deleteModal.eventName}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default Events;
