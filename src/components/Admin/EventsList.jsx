import React, { useState } from "react";
import "./EventsList.css";
import { API_BASE_URL } from "../../config";

const EventsList = ({ events, onEventDeleted, onRefresh }) => {
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("eventDate");
  const [loading, setLoading] = useState(false);

  const handleDelete = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          onEventDeleted();
        } else {
          alert("Error deleting event");
        }
      } catch (error) {
        console.error("Error deleting event:", error);
        alert("Error deleting event");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStatusChange = async (eventId, newStatus) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        onRefresh();
      } else {
        alert("Error updating event status");
      }
    } catch (error) {
      console.error("Error updating event status:", error);
      alert("Error updating event status");
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((event) => {
    if (filter === "all") return true;
    if (filter === "upcoming") {
      return new Date(event.eventDate) >= new Date();
    }
    return event.status === filter;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === "eventDate") {
      return new Date(a.eventDate) - new Date(b.eventDate);
    }
    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === "status") {
      return a.status.localeCompare(b.status);
    }
    return 0;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "published":
        return "status-published";
      case "draft":
        return "status-draft";
      case "cancelled":
        return "status-cancelled";
      case "completed":
        return "status-completed";
      default:
        return "status-default";
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case "urgent":
        return "priority-urgent";
      case "high":
        return "priority-high";
      case "medium":
        return "priority-medium";
      case "low":
        return "priority-low";
      default:
        return "priority-default";
    }
  };

  return (
    <div className="events-list">
      <div className="list-header">
        <h2>Manage Events</h2>
        <div className="list-controls">
          <div className="filter-group">
            <label>Filter:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Events</option>
              <option value="upcoming">Upcoming</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="sort-group">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="eventDate">Date</option>
              <option value="title">Title</option>
              <option value="status">Status</option>
            </select>
          </div>

          <button onClick={onRefresh} className="refresh-btn">
            Refresh
          </button>
        </div>
      </div>

      {loading && <div className="loading">Loading...</div>}

      <div className="events-grid">
        {sortedEvents.length === 0 ? (
          <div className="no-events">No events found</div>
        ) : (
          sortedEvents.map((event) => (
            <div key={event._id} className="event-card">
              <div className="event-header">
                <h3>{event.title}</h3>
                <div className="event-badges">
                  <span
                    className={`badge ${getStatusBadgeClass(event.status)}`}
                  >
                    {event.status}
                  </span>
                  <span
                    className={`badge ${getPriorityBadgeClass(event.priority)}`}
                  >
                    {event.priority}
                  </span>
                </div>
              </div>

              <div className="event-details">
                <p className="event-description">{event.description}</p>

                <div className="event-info">
                  <div className="info-item">
                    <strong>Date:</strong> {formatDate(event.eventDate)}
                  </div>
                  <div className="info-item">
                    <strong>Time:</strong> {event.startTime} - {event.endTime}
                  </div>
                  <div className="info-item">
                    <strong>Location:</strong> {event.location}
                  </div>
                  <div className="info-item">
                    <strong>Category:</strong> {event.category}
                  </div>
                  <div className="info-item">
                    <strong>Organizer:</strong> {event.organizer}
                  </div>
                  {event.attendees && event.attendees.length > 0 && (
                    <div className="info-item">
                      <strong>Attendees:</strong> {event.attendees.length}
                    </div>
                  )}
                  {event.tags && event.tags.length > 0 && (
                    <div className="info-item">
                      <strong>Tags:</strong> {event.tags.join(", ")}
                    </div>
                  )}
                </div>
              </div>

              <div className="event-actions">
                <div className="status-controls">
                  <label>Status:</label>
                  <select
                    value={event.status}
                    onChange={(e) =>
                      handleStatusChange(event._id, e.target.value)
                    }
                    disabled={loading}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="action-buttons">
                  <button
                    onClick={() => handleDelete(event._id)}
                    className="delete-btn"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="events-summary">
        <p>
          Total Events: {events.length} | Showing: {sortedEvents.length}
        </p>
      </div>
    </div>
  );
};

export default EventsList;
