import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../Header/Header";
import Footer from "../../Footer/Footer";
import AddGuestForm from "./AddGuestForm";
import EditGuestForm from "./EditGuestForm";
import DeleteGuestModal from "./DeleteGuestModal";
import AuthService from "../../../services/authService";
import { API_BASE_URL } from "../../../config";
import "./Guests.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faUsers,
  faEdit,
  faTrash,
  faEye,
  faUserFriends,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";

const Guests = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [guests, setGuests] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    guestId: null,
    guestName: "",
  });
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();

  // Fetch guests from the database
  const fetchGuests = async () => {
    try {
      setLoading(true);
      const token = AuthService.getToken();

      if (!token) {
        setError("Please login to view guests");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/guests`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched guests:", data); // Debug log
        setGuests(data);
        setError("");
      } else if (response.status === 401) {
        setError("Authentication failed. Please login again.");
        AuthService.removeToken();
      } else {
        setError("Failed to fetch guests");
      }
    } catch (error) {
      console.error("Error fetching guests:", error);
      setError("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  // Fetch events from the database
  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/events`);

      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        console.error("Failed to fetch events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  // Load guests and events when component mounts
  useEffect(() => {
    fetchGuests();
    fetchEvents();
  }, []);

  const handleStatusUpdate = async (guestId, eventId, type, value) => {
    try {
      setIsUpdating(true);
      setError("");

      const token = AuthService.getToken();
      if (!token) {
        setError("Authentication token missing. Please login again.");
        return;
      }

      if (!eventId || eventId === "all") {
        setError("Please select a specific event before updating RSVP status");
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
          [type]: value,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      // Refresh the guest list
      await fetchGuests();
      setError("");
    } catch (error) {
      console.error("Error updating status:", error);
      setError(error.message || "Failed to update status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter guests based on search query, event, and category
  const filteredGuests = guests.filter((guest) => {
    const matchesSearch =
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (guest.phone &&
        guest.phone.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (guest.address &&
        guest.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (guest.city &&
        guest.city.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      categoryFilter === "all" || guest.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Calculate totals for the selected event
  const totals = filteredGuests.reduce(
    (acc, guest) => {
      if (selectedEvent === "all") {
        // For "all" events, sum up attendee counts from all guest events
        const totalForGuest =
          guest.guestEvents?.reduce((sum, ge) => {
            return sum + (ge.attendeeCount || 0);
          }, 0) || 0;
        return {
          total: acc.total + totalForGuest,
        };
      } else {
        // For specific event, get attendee count from guestEvent
        const guestEvent = getGuestEvent(guest, selectedEvent);
        const attendeeCount = guestEvent?.attendeeCount || 0;
        return {
          total: acc.total + attendeeCount,
        };
      }
    },
    { total: 0 }
  );

  const handleAddGuest = () => {
    setShowAddForm(true);
  };

  const handleEditGuest = (guest) => {
    setEditingGuest(guest);
  };

  const handleDeleteGuest = (guestId, guestName) => {
    setDeleteModal({
      isOpen: true,
      guestId,
      guestName,
    });
  };

  const confirmDelete = async () => {
    try {
      const token = AuthService.getToken();
      const response = await fetch(
        `${API_BASE_URL}/guests/${deleteModal.guestId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        fetchGuests(); // Refresh the list
        setDeleteModal({ isOpen: false, guestId: null, guestName: "" });
      } else {
        alert("Failed to delete guest");
      }
    } catch (error) {
      console.error("Error deleting guest:", error);
      alert("Error deleting guest");
    }
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, guestId: null, guestName: "" });
  };

  const handleFormClose = () => {
    setShowAddForm(false);
    setEditingGuest(null);
    fetchGuests(); // Refresh the list
  };

  // Get GuestEvent for the selected event
  const getGuestEvent = (guest, eventId) => {
    return guest.guestEvents?.find((ge) => ge.eventId._id === eventId);
  };

  // CSV Export functionality
  const exportToCSV = () => {
    // Define CSV headers
    const headers = [
      "Name",
      "Phone",
      "Address",
      "City",
      "Country",
      "Category",
      "Attendee Count",
      "Selected Events",
      "Invitation Status",
      "RSVP Status",
      "Notes",
    ];

    // Convert guest data to CSV rows
    const csvData = filteredGuests.map((guest) => {
      const guestEvent =
        selectedEvent !== "all" ? getGuestEvent(guest, selectedEvent) : null;

      const attendeeCount =
        selectedEvent !== "all"
          ? guestEvent?.attendeeCount || 0
          : guest.guestEvents?.reduce(
              (sum, ge) => sum + (ge.attendeeCount || 0),
              0
            ) || 0;

      const selectedEvents =
        guest.selectedEvents?.map((event) => event.title).join("; ") || "None";

      const invitationStatus = guestEvent?.invitationStatus || "not_sent";
      const rsvpStatus = guestEvent?.rsvpStatus || "pending";

      return [
        `"${guest.name || ""}"`,
        `"${guest.phone || ""}"`,
        `"${guest.address || ""}"`,
        `"${guest.city || ""}"`,
        `"${guest.country || ""}"`,
        `"${guest.category === "bride" ? "Bride's Side" : "Groom's Side"}"`,
        attendeeCount,
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
    const filename = `guests_${eventName.replace(
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
    return (
      <>
        <div className="guests-root">
          <div className="loading-message">Loading guests...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="guests-root">
          <div className="error-message">
            {error}
            <button onClick={fetchGuests} className="retry-btn">
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="guests-root">
        <div className="guests-header">
          <div className="guests-header-row">
            <div className="action-buttons">
              <button className="add-guest-btn" onClick={handleAddGuest}>
                <FontAwesomeIcon icon={faPlus} />
                Add New Guest
              </button>
              <button
                className="export-csv-btn"
                onClick={exportToCSV}
                style={{ backgroundColor: "red", color: "white" }}
              >
                <FontAwesomeIcon icon={faDownload} />
                Export CSV TEST
              </button>
            </div>
            <input
              type="text"
              placeholder="Search guests..."
              className="guests-search-bar"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Controls */}
          <div className="filter-controls">
            <div className="category-filter">
              <label>Category:</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Categories</option>
                <option value="bride">Bride's Side</option>
                <option value="groom">Groom's Side</option>
              </select>
            </div>

            <div className="event-filter">
              <label>Event:</label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Events</option>
                {events.map((event) => (
                  <option key={event._id} value={event._id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <FontAwesomeIcon icon={faUsers} className="summary-icon" />
              <div className="summary-content">
                <div className="summary-number">{filteredGuests.length}</div>
                <div className="summary-label">Guest Entries</div>
              </div>
            </div>

            <div className="summary-card total">
              <FontAwesomeIcon icon={faUserFriends} className="summary-icon" />
              <div className="summary-content">
                <div className="summary-number">{totals.total}</div>
                <div className="summary-label">Total Attendees</div>
              </div>
            </div>
          </div>
        </div>

        {/* Guests Table */}
        <div className="guests-table-container">
          {filteredGuests.length === 0 ? (
            <div className="no-guests-message">
              {searchQuery || categoryFilter !== "all"
                ? "No guests match your filters."
                : "No guests yet. Add your first guest!"}
            </div>
          ) : (
            <table className="guests-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th>Category</th>
                  <th>Invitation Status</th>
                  <th>RSVP Status</th>
                  <th>Attendee Count</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.map((guest) => {
                  const guestEvent =
                    selectedEvent !== "all"
                      ? getGuestEvent(guest, selectedEvent)
                      : null;

                  return (
                    <tr key={guest._id}>
                      <td className="guest-name">{guest.name}</td>
                      <td>{guest.phone || "-"}</td>
                      <td>
                        {[guest.city, guest.country]
                          .filter(Boolean)
                          .join(", ") || "-"}
                      </td>
                      <td>
                        <span className={`category-badge ${guest.category}`}>
                          {guest.category === "bride"
                            ? "Bride's Side"
                            : "Groom's Side"}
                        </span>
                      </td>
                      <td>
                        <select
                          className={`status-badge invitation-${
                            guestEvent?.invitationStatus || "not_sent"
                          }`}
                          value={guestEvent?.invitationStatus || "not_sent"}
                          onChange={(e) =>
                            handleStatusUpdate(
                              guest._id,
                              selectedEvent,
                              "invitationStatus",
                              e.target.value
                            )
                          }
                          disabled={selectedEvent === "all"}
                        >
                          <option value="not_sent">NOT SENT</option>
                          <option value="sent">SENT</option>
                          <option value="delivered">DELIVERED</option>
                          <option value="opened">OPENED</option>
                        </select>
                      </td>
                      <td>
                        <select
                          className={`status-badge rsvp-${
                            guestEvent?.rsvpStatus || "pending"
                          }`}
                          value={guestEvent?.rsvpStatus || "pending"}
                          onChange={(e) =>
                            handleStatusUpdate(
                              guest._id,
                              selectedEvent,
                              "rsvpStatus",
                              e.target.value
                            )
                          }
                          disabled={selectedEvent === "all" || isUpdating}
                        >
                          <option value="pending">PENDING</option>
                          <option value="confirmed">CONFIRMED</option>
                          <option value="declined">DECLINED</option>
                          <option value="maybe">MAYBE</option>
                        </select>
                      </td>
                      <td className="attendee-count">
                        {selectedEvent !== "all"
                          ? guestEvent?.attendeeCount || 0
                          : guest.guestEvents?.reduce(
                              (sum, ge) => sum + (ge.attendeeCount || 0),
                              0
                            ) || 0}
                      </td>
                      <td className="notes-cell">
                        {guest.notes ? (
                          <span title={guest.notes}>
                            {guest.notes.length > 30
                              ? `${guest.notes.substring(0, 30)}...`
                              : guest.notes}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="actions-cell">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEditGuest(guest)}
                          title="Edit Guest"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() =>
                            handleDeleteGuest(guest._id, guest.name)
                          }
                          title="Delete Guest"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddForm && (
        <AddGuestForm onClose={handleFormClose} events={events} />
      )}

      {editingGuest && (
        <EditGuestForm
          guest={editingGuest}
          onClose={handleFormClose}
          events={events}
        />
      )}

      {deleteModal.isOpen && (
        <DeleteGuestModal
          isOpen={deleteModal.isOpen}
          guestName={deleteModal.guestName}
          onConfirm={confirmDelete}
          onClose={closeDeleteModal}
        />
      )}
    </>
  );
};

export default Guests;
