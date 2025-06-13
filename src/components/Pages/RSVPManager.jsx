import React, { useState, useEffect } from "react";
import "./RSVPManager.css";
import AuthService from "../../services/authService";
import AddGuestForm from "../Pages/Guests/AddGuestForm";
import EditGuestForm from "../Pages/Guests/EditGuestForm";

// Use the same API base URL configuration as AuthService
const API_BASE_URL =
  process.env.NODE_ENV === "production" ? "/api" : "http://localhost:5001/api";

const RSVPManager = () => {
  const [guests, setGuests] = useState([]);
  const [events, setEvents] = useState([]);
  const [rsvpData, setRsvpData] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddGuestForm, setShowAddGuestForm] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);

  useEffect(() => {
    fetchRSVPData();
  }, []);

  const fetchRSVPData = async () => {
    try {
      setLoading(true);
      const token = AuthService.getToken();

      if (!token) {
        setError("No authentication token found");
        return;
      }

      // Fetch guests with their event details
      const guestsResponse = await fetch(`${API_BASE_URL}/guests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!guestsResponse.ok) {
        throw new Error("Failed to fetch guests data");
      }

      const guestsData = await guestsResponse.json();
      setGuests(guestsData);

      // Fetch events
      const eventsResponse = await fetch(`${API_BASE_URL}/events`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!eventsResponse.ok) {
        throw new Error("Failed to fetch events data");
      }

      const eventsData = await eventsResponse.json();
      setEvents(eventsData);
    } catch (error) {
      console.error("Error fetching RSVP data:", error);
      setError("Failed to load RSVP data");
    } finally {
      setLoading(false);
    }
  };

  const handleRSVPUpdate = async (guestId, eventId, rsvpData) => {
    try {
      const token = AuthService.getToken();
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/guests/rsvp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          guestId,
          eventId,
          ...rsvpData,
        }),
      });

      const responseData = await response.json();
      console.log("Server response:", responseData);

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to update RSVP");
      }

      // Refresh data
      await fetchRSVPData();
    } catch (error) {
      console.error("Error updating RSVP:", error);
      setError(error.message || "Failed to update RSVP status");

      // Still refresh the data to ensure we're in sync
      await fetchRSVPData();
    }
  };

  const handleAddGuest = async (guestData) => {
    try {
      const token = AuthService.getToken();
      const response = await fetch(`${API_BASE_URL}/guests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(guestData),
      });

      if (!response.ok) {
        throw new Error("Failed to add guest");
      }

      setShowAddGuestForm(false);
      fetchRSVPData();
    } catch (error) {
      console.error("Error adding guest:", error);
      setError("Failed to add guest");
    }
  };

  const handleUpdateGuest = async (guestId, guestData) => {
    try {
      const token = AuthService.getToken();
      const response = await fetch(`${API_BASE_URL}/guests/${guestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(guestData),
      });

      if (!response.ok) {
        throw new Error("Failed to update guest");
      }

      setEditingGuest(null);
      fetchRSVPData();
    } catch (error) {
      console.error("Error updating guest:", error);
      setError("Failed to update guest");
    }
  };

  const handleDeleteGuest = async (guestId) => {
    if (!window.confirm("Are you sure you want to delete this guest?")) {
      return;
    }

    try {
      const token = AuthService.getToken();
      const response = await fetch(`${API_BASE_URL}/guests/${guestId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete guest");
      }

      fetchRSVPData();
    } catch (error) {
      console.error("Error deleting guest:", error);
      setError("Failed to delete guest");
    }
  };

  const getGuestRSVPForEvent = (guest, eventId) => {
    return guest.guestEvents?.find((event) => event.eventId._id === eventId);
  };

  const getFilteredGuests = () => {
    if (selectedEvent === "all") {
      return guests;
    }

    // Show guests who have the selected event in their guestEvents
    return guests.filter((guest) =>
      guest.guestEvents?.some((event) => event.eventId._id === selectedEvent)
    );
  };

  const formatAddress = (address) => {
    if (!address) return "N/A";
    const parts = [
      address.street,
      address.city,
      address.state,
      address.zipCode,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "N/A";
  };

  if (loading) {
    return <div className="loading">Loading RSVP data...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="rsvp-manager">
      <div className="rsvp-header">
        <h1>RSVP Manager</h1>
        <button
          className="add-guest-btn"
          onClick={() => setShowAddGuestForm(true)}
        >
          Add Guest
        </button>
      </div>

      <div className="event-filter">
        <label>Filter by Event:</label>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
        >
          <option value="all">All Events</option>
          {events.map((event) => (
            <option key={event._id} value={event._id}>
              {event.title}
            </option>
          ))}
        </select>
      </div>

      <div className="rsvp-table-container">
        <table className="rsvp-table">
          <thead>
            <tr>
              <th>Guest Name</th>
              <th>Phone</th>
              <th>Location</th>
              {selectedEvent !== "all" && (
                <>
                  <th>RSVP Status</th>
                  <th>Invitation Status</th>
                  <th>Men</th>
                  <th>Women</th>
                  <th>Kids</th>
                </>
              )}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getFilteredGuests().map((guest) => {
              const rsvp =
                selectedEvent !== "all"
                  ? getGuestRSVPForEvent(guest, selectedEvent)
                  : null;

              return (
                <tr key={guest._id}>
                  <td>{guest.name}</td>
                  <td>{guest.phone || "N/A"}</td>
                  <td>{formatAddress(guest.address)}</td>
                  {selectedEvent !== "all" && (
                    <>
                      <td>
                        <select
                          value={rsvp?.rsvpStatus || "pending"}
                          onChange={(e) =>
                            handleRSVPUpdate(guest._id, selectedEvent, {
                              rsvpStatus: e.target.value,
                            })
                          }
                          className={`rsvp-status ${
                            rsvp?.rsvpStatus || "pending"
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="declined">Declined</option>
                          <option value="maybe">Maybe</option>
                        </select>
                      </td>
                      <td>
                        <select
                          value={rsvp?.invitationStatus || "not_sent"}
                          onChange={(e) =>
                            handleRSVPUpdate(guest._id, selectedEvent, {
                              invitationStatus: e.target.value,
                            })
                          }
                          className="invitation-status"
                        >
                          <option value="not_sent">Not Sent</option>
                          <option value="sent">Sent</option>
                          <option value="delivered">Delivered</option>
                          <option value="opened">Opened</option>
                        </select>
                      </td>
                      <td>{guest.eventAttendees?.[selectedEvent]?.men || 0}</td>
                      <td>
                        {guest.eventAttendees?.[selectedEvent]?.women || 0}
                      </td>
                      <td>
                        {guest.eventAttendees?.[selectedEvent]?.kids || 0}
                      </td>
                    </>
                  )}
                  <td className="actions">
                    <button
                      className="edit-btn"
                      onClick={() => setEditingGuest(guest)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteGuest(guest._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showAddGuestForm && (
        <AddGuestForm
          onClose={() => setShowAddGuestForm(false)}
          events={events}
        />
      )}

      {editingGuest && (
        <EditGuestForm
          guest={editingGuest}
          events={events}
          onClose={() => {
            setEditingGuest(null);
            fetchRSVPData();
          }}
        />
      )}
    </div>
  );
};

export default RSVPManager;
