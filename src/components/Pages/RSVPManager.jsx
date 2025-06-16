import React, { useState, useEffect } from "react";
import "./RSVPManager.css";
import AuthService from "../../services/authService";
import AddGuestForm from "../Pages/Guests/AddGuestForm";
import EditGuestForm from "../Pages/Guests/EditGuestForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState(null);

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

  const handleDeleteGuest = (guestId) => {
    const guest = guests.find((g) => g._id === guestId);
    setGuestToDelete(guest);
    setShowDeleteModal(true);
  };

  const confirmDeleteGuest = async () => {
    if (!guestToDelete) return;

    try {
      const token = AuthService.getToken();
      const response = await fetch(
        `${API_BASE_URL}/guests/${guestToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete guest");
      }

      fetchRSVPData();
      setShowDeleteModal(false);
      setGuestToDelete(null);
    } catch (error) {
      console.error("Error deleting guest:", error);
      setError("Failed to delete guest");
    }
  };

  const cancelDeleteGuest = () => {
    setShowDeleteModal(false);
    setGuestToDelete(null);
  };

  const handleDeleteRSVP = async (guestId, eventId) => {
    const event = events.find((e) => e._id === eventId);
    const guest = guests.find((g) => g._id === guestId);

    if (
      !window.confirm(
        `Are you sure you want to delete ${guest?.name}'s RSVP for "${event?.title}"?`
      )
    ) {
      return;
    }

    try {
      const token = AuthService.getToken();
      const response = await fetch(
        `${API_BASE_URL}/guests/${guestId}/events/${eventId}/rsvp`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete RSVP");
      }

      fetchRSVPData();
    } catch (error) {
      console.error("Error deleting RSVP:", error);
      setError("Failed to delete RSVP");
    }
  };

  const getGuestRSVPForEvent = (guest, eventId) => {
    return guest.guestEvents?.find((event) => event.eventId._id === eventId);
  };

  const getFilteredGuests = () => {
    if (selectedEvent === "all") {
      return guests;
    }

    // Show guests who have the selected event in their guestEvents OR selectedEvents
    return guests.filter((guest) => {
      // Check if guest has this event in guestEvents
      const hasGuestEvent = guest.guestEvents?.some(
        (event) => event.eventId && event.eventId._id === selectedEvent
      );

      // Check if guest has this event in selectedEvents (for backwards compatibility)
      const hasSelectedEvent = guest.selectedEvents?.some(
        (event) => event._id === selectedEvent
      );

      return hasGuestEvent || hasSelectedEvent;
    });
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

  // CSV Export functionality
  const exportToCSV = () => {
    const filteredGuests = getFilteredGuests();

    // Define CSV headers
    const headers = [
      "Guest Name",
      "Phone",
      "Address",
      "City",
      "Country",
      "Category",
      "Men",
      "Women",
      "Kids",
      "Total Attendees",
      "Selected Events",
      "Invitation Status",
      "RSVP Status",
      "Notes",
    ];

    // Convert guest data to CSV rows
    const csvData = filteredGuests.map((guest) => {
      const eventAttendees =
        selectedEvent !== "all"
          ? guest.eventAttendees?.[selectedEvent] || {}
          : Object.values(guest.eventAttendees || {}).reduce(
              (acc, counts) => ({
                men: acc.men + (counts.men || 0),
                women: acc.women + (counts.women || 0),
                kids: acc.kids + (counts.kids || 0),
              }),
              { men: 0, women: 0, kids: 0 }
            );

      const guestEvent =
        selectedEvent !== "all"
          ? getGuestRSVPForEvent(guest, selectedEvent)
          : null;

      const totalAttendees =
        (eventAttendees.men || 0) +
        (eventAttendees.women || 0) +
        (eventAttendees.kids || 0);

      const selectedEvents =
        guest.selectedEvents?.map((event) => event.title).join("; ") ||
        guest.guestEvents?.map((ge) => ge.eventId.title).join("; ") ||
        "None";

      const invitationStatus = guestEvent?.invitationStatus || "not_sent";
      const rsvpStatus = guestEvent?.rsvpStatus || "pending";

      return [
        `"${guest.name || ""}"`,
        `"${guest.phone || ""}"`,
        `"${guest.address || ""}"`,
        `"${guest.city || ""}"`,
        `"${guest.country || ""}"`,
        `"${
          guest.category === "bride"
            ? "Bride's Side"
            : guest.category === "groom"
            ? "Groom's Side"
            : guest.category || ""
        }"`,
        eventAttendees.men || 0,
        eventAttendees.women || 0,
        eventAttendees.kids || 0,
        totalAttendees,
        `"${selectedEvents}"`,
        `"${invitationStatus.toUpperCase()}"`,
        `"${rsvpStatus.toUpperCase()}"`,
        `"${guest.notes || ""}"`,
      ];
    });

    // Combine headers and data
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);

    // Generate filename with current date
    const currentDate = new Date().toISOString().split("T")[0];
    const eventName =
      selectedEvent !== "all"
        ? events.find((e) => e._id === selectedEvent)?.title || "Selected"
        : "All";
    const filename = `rsvp_manager_${eventName.replace(
      /\s+/g,
      "_"
    )}_${currentDate}.csv`;

    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <div className="header-actions">
          <button className="export-csv-btn" onClick={exportToCSV}>
            <FontAwesomeIcon icon={faDownload} />
            Export CSV
          </button>
          <button
            className="add-guest-btn"
            onClick={() => setShowAddGuestForm(true)}
          >
            Add Guest
          </button>
        </div>
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
                      className="rsvp-delete-guest-btn"
                      onClick={() => handleDeleteGuest(guest._id)}
                      title="Delete this guest completely"
                      style={{
                        backgroundColor: "#ffebee",
                        color: "#d32f2f",
                        border: "1px solid #ffcdd2",
                        padding: "0.5rem 1rem",
                        borderRadius: "6px",
                        fontSize: "0.85rem",
                        fontWeight: "500",
                        cursor: "pointer",
                        marginRight: "0.5rem",
                        display: "inline-block !important",
                        visibility: "visible !important",
                        opacity: "1 !important",
                        transition: "all 0.3s ease",
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = "#ffcdd2";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = "#ffebee";
                      }}
                    >
                      Delete
                    </button>
                    <button
                      className="edit-btn"
                      onClick={() => setEditingGuest(guest)}
                      title="Edit guest information"
                    >
                      Edit
                    </button>
                    {selectedEvent !== "all" && rsvp && (
                      <button
                        className="delete-rsvp-btn"
                        onClick={() =>
                          handleDeleteRSVP(guest._id, selectedEvent)
                        }
                        title="Delete RSVP for this event"
                      >
                        Delete RSVP
                      </button>
                    )}
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

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="delete-confirmation-modal">
            <div className="modal-header">
              <h3>Confirm Delete</h3>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete{" "}
                <strong>{guestToDelete?.name}</strong>?
              </p>
              <p className="warning-text">
                This action cannot be undone. The guest will be permanently
                removed from all events.
              </p>
            </div>
            <div className="modal-actions">
              <button
                className="delete-modal-cancel-btn"
                onClick={cancelDeleteGuest}
              >
                Cancel
              </button>
              <button
                className="confirm-delete-btn"
                onClick={confirmDeleteGuest}
              >
                Delete Guest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RSVPManager;
