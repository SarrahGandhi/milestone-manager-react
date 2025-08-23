import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "../../Footer/Footer";
import DeleteEventModal from "./DeleteEventModal";
import AuthService from "../../../services/authService";
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
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { getApiUrl } from "../../../config";

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    eventId: null,
    eventName: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch event details from the database
  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl(`/events/${eventId}`), {
        headers: AuthService.getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setEvent(data);
        setError("");
      } else if (response.status === 404) {
        setError("Event not found");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to fetch event details");
      }
    } catch (error) {
      console.error("Error fetching event:", error);
      setError("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Helper function to get day of week
  const getDayOfWeek = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "long" });
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
  const handleDeleteEvent = () => {
    setDeleteModal({
      isOpen: true,
      eventId: event._id,
      eventName: event.title,
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.eventId) return;

    try {
      setIsDeleting(true);
      const response = await fetch(
        getApiUrl(`/events/${deleteModal.eventId}`),
        {
          method: "DELETE",
          headers: AuthService.getAuthHeaders(),
        }
      );

      if (response.ok) {
        // Navigate back to events list after successful deletion
        navigate("/events");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to delete event");
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Error deleting event");
      setIsDeleting(false);
    }
  };

  const closeDeleteModal = () => {
    if (!isDeleting) {
      setDeleteModal({ isOpen: false, eventId: null, eventName: "" });
    }
  };

  if (loading) {
    return (
      <>
        <div className="event-details-root">
          <div className="loading-message">Loading event details...</div>
        </div>
      </>
    );
  }

  if (error || !event) {
    return (
      <>
        <div className="event-details-root">
          <div className="event-not-found">
            <h2>{error || "Event Not Found"}</h2>
            <button onClick={() => navigate("/events")} className="back-btn">
              <FontAwesomeIcon icon={faArrowLeft} /> Back to Events
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="event-details-root">
        <div className="event-details-header">
          <button onClick={() => navigate("/events")} className="back-btn">
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Events
          </button>
          <div className="event-details-actions">
            <button
              className="edit-event-btn"
              onClick={() => navigate(`/events/edit/${event.id}`)}
            >
              <FontAwesomeIcon icon={faEdit} /> Edit Event
            </button>
            <button className="delete-event-btn" onClick={handleDeleteEvent}>
              <FontAwesomeIcon icon={faTrash} /> Delete Event
            </button>
          </div>
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

            {event.organizer && (
              <div className="event-detail-card">
                <div className="detail-header">
                  <FontAwesomeIcon icon={faUsers} />
                  <h3>Organizer</h3>
                </div>
                <div className="detail-content">
                  <p>{event.organizer}</p>
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

            {event.status && (
              <div className="event-detail-card">
                <div className="detail-header">
                  <FontAwesomeIcon icon={faClock} />
                  <h3>Status</h3>
                </div>
                <div className="detail-content">
                  <p style={{ textTransform: "capitalize" }}>{event.status}</p>
                </div>
              </div>
            )}
          </div>
        </div>
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

export default EventDetails;
