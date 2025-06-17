import React, { useState, useEffect } from "react";
import "./RSVPManager.css";
import AuthService from "../../services/authService";
import AddGuestForm from "../Pages/Guests/AddGuestForm";
import EditGuestForm from "../Pages/Guests/EditGuestForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import { useAuth } from "../../context/AuthContext";

// Use the centralized API configuration
import { getApiUrl } from "../../config";

const RSVPManager = () => {
  const [guests, setGuests] = useState([]);
  const [events, setEvents] = useState([]);
  const [rsvpData, setRsvpData] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showAddGuestForm, setShowAddGuestForm] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState(null);
  const { canEdit, canDelete } = useAuth();

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
      const guestsResponse = await fetch(getApiUrl("/guests"), {
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
      const eventsResponse = await fetch(getApiUrl("/events"), {
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
      setError(""); // Clear any existing errors
      const token = AuthService.getToken();
      if (!token) {
        setError("No authentication token found");
        return;
      }

      console.log("Sending RSVP update:", { guestId, eventId, rsvpData });

      const response = await fetch(getApiUrl("/guests/rsvp"), {
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

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      let responseData;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        // If response is not JSON, get text
        const responseText = await response.text();
        console.log("Non-JSON response:", responseText);
        throw new Error("Server returned invalid response format");
      }

      console.log("Server response data:", responseData);

      if (!response.ok) {
        throw new Error(
          responseData.message || `Server error: ${response.status}`
        );
      }

      // Refresh data only after successful update
      await fetchRSVPData();
      setSuccessMessage("RSVP status updated successfully!");
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
      console.log("RSVP update completed successfully");
    } catch (error) {
      console.error("Error updating RSVP:", error);
      setError(error.message || "Failed to update RSVP status");

      // Still refresh the data to ensure we're in sync, but after a short delay
      setTimeout(async () => {
        await fetchRSVPData();
      }, 1000);
    }
  };

  const handleAddGuest = async (guestData) => {
    try {
      const token = AuthService.getToken();
      const response = await fetch(getApiUrl("/guests"), {
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
      const response = await fetch(getApiUrl(`/guests/${guestId}`), {
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
      const response = await fetch(getApiUrl(`/guests/${guestToDelete._id}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
        getApiUrl(`/guests/${guestId}/events/${eventId}/rsvp`),
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

  // Excel Export functionality with separate sheets for each event
  const exportToExcel = () => {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Define headers
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
      "Invitation Status",
      "RSVP Status",
      "Notes",
    ];

    // Helper function to create sheet data for an event
    const createSheetDataForEvent = (eventId, eventTitle) => {
      // Get guests for this specific event
      const eventGuests = guests.filter((guest) => {
        const hasGuestEvent = guest.guestEvents?.some(
          (event) => event.eventId && event.eventId._id === eventId
        );
        const hasSelectedEvent = guest.selectedEvents?.some(
          (event) => event._id === eventId
        );
        return hasGuestEvent || hasSelectedEvent;
      });

      // Convert guest data to sheet rows
      const sheetData = eventGuests.map((guest) => {
        const eventAttendees = guest.eventAttendees?.[eventId] || {};
        const guestEvent = getGuestRSVPForEvent(guest, eventId);

        const totalAttendees =
          (eventAttendees.men || 0) +
          (eventAttendees.women || 0) +
          (eventAttendees.kids || 0);

        const invitationStatus = guestEvent?.invitationStatus || "not_sent";
        const rsvpStatus = guestEvent?.rsvpStatus || "pending";

        return {
          "Guest Name": guest.name || "",
          Phone: guest.phone || "",
          Address: guest.address || "",
          City: guest.city || "",
          Country: guest.country || "",
          Category:
            guest.category === "bride"
              ? "Bride's Side"
              : guest.category === "groom"
              ? "Groom's Side"
              : guest.category || "",
          Men: eventAttendees.men || 0,
          Women: eventAttendees.women || 0,
          Kids: eventAttendees.kids || 0,
          "Total Attendees": totalAttendees,
          "Invitation Status": invitationStatus.toUpperCase(),
          "RSVP Status": rsvpStatus.toUpperCase(),
          Notes: guest.notes || "",
        };
      });

      return sheetData;
    };

    // Create a sheet for each event
    events.forEach((event) => {
      const sheetData = createSheetDataForEvent(event._id, event.title);

      // Only create sheet if there are guests for this event
      if (sheetData.length > 0) {
        const worksheet = XLSX.utils.json_to_sheet(sheetData);

        // Auto-size columns
        const colWidths = headers.map((header) => {
          const maxLength = Math.max(
            header.length,
            ...sheetData.map((row) => String(row[header] || "").length)
          );
          return { wch: Math.min(maxLength + 2, 50) }; // Cap at 50 characters
        });
        worksheet["!cols"] = colWidths;

        // Clean sheet name (remove special characters for Excel compatibility)
        const cleanSheetName = event.title
          .replace(/[:\\\/?*\[\]]/g, "")
          .substring(0, 31);
        XLSX.utils.book_append_sheet(workbook, worksheet, cleanSheetName);
      }
    });

    // Create an "All Events" summary sheet
    const allGuestsData = guests.map((guest) => {
      // Calculate totals across all events
      const totalAttendees = Object.values(guest.eventAttendees || {}).reduce(
        (acc, counts) => ({
          men: acc.men + (counts.men || 0),
          women: acc.women + (counts.women || 0),
          kids: acc.kids + (counts.kids || 0),
        }),
        { men: 0, women: 0, kids: 0 }
      );

      const selectedEvents =
        guest.selectedEvents?.map((event) => event.title).join("; ") ||
        guest.guestEvents?.map((ge) => ge.eventId.title).join("; ") ||
        "None";

      const totalCount =
        totalAttendees.men + totalAttendees.women + totalAttendees.kids;

      return {
        "Guest Name": guest.name || "",
        Phone: guest.phone || "",
        Address: guest.address || "",
        City: guest.city || "",
        Country: guest.country || "",
        Category:
          guest.category === "bride"
            ? "Bride's Side"
            : guest.category === "groom"
            ? "Groom's Side"
            : guest.category || "",
        Men: totalAttendees.men,
        Women: totalAttendees.women,
        Kids: totalAttendees.kids,
        "Total Attendees": totalCount,
        "Selected Events": selectedEvents,
        Notes: guest.notes || "",
      };
    });

    if (allGuestsData.length > 0) {
      const summaryHeaders = [
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
        "Notes",
      ];

      const summaryWorksheet = XLSX.utils.json_to_sheet(allGuestsData);

      // Auto-size columns for summary sheet
      const summaryColWidths = summaryHeaders.map((header) => {
        const maxLength = Math.max(
          header.length,
          ...allGuestsData.map((row) => String(row[header] || "").length)
        );
        return { wch: Math.min(maxLength + 2, 50) };
      });
      summaryWorksheet["!cols"] = summaryColWidths;

      XLSX.utils.book_append_sheet(
        workbook,
        summaryWorksheet,
        "All Events Summary"
      );
    }

    // Generate filename with current date
    const currentDate = new Date().toISOString().split("T")[0];
    const filename = `rsvp_manager_${currentDate}.xlsx`;

    // Write and download the file
    XLSX.writeFile(workbook, filename);
  };

  if (loading) {
    return <div className="loading">Loading RSVP data...</div>;
  }

  return (
    <div className="rsvp-manager">
      <div className="rsvp-header">
        <h1>RSVP Manager</h1>
        <div className="header-actions">
          <button className="export-excel-btn" onClick={exportToExcel}>
            <FontAwesomeIcon icon={faDownload} />
            Export Excel
          </button>
          {canEdit() && (
            <button
              className="add-guest-btn"
              onClick={() => setShowAddGuestForm(true)}
            >
              Add Guest
            </button>
          )}
        </div>
      </div>

      {error && (
        <div
          className="error-message"
          style={{
            backgroundColor: "#ffebee",
            color: "#d32f2f",
            padding: "1rem",
            marginBottom: "1rem",
            borderRadius: "4px",
            border: "1px solid #ffcdd2",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            style={{
              background: "none",
              border: "none",
              color: "#d32f2f",
              cursor: "pointer",
              fontSize: "1.2rem",
              fontWeight: "bold",
            }}
          >
            ×
          </button>
        </div>
      )}

      {successMessage && (
        <div
          className="success-message"
          style={{
            backgroundColor: "#e8f5e8",
            color: "#2e7d32",
            padding: "1rem",
            marginBottom: "1rem",
            borderRadius: "4px",
            border: "1px solid #c8e6c9",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{successMessage}</span>
          <button
            onClick={() => setSuccessMessage("")}
            style={{
              background: "none",
              border: "none",
              color: "#2e7d32",
              cursor: "pointer",
              fontSize: "1.2rem",
              fontWeight: "bold",
            }}
          >
            ×
          </button>
        </div>
      )}

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
                    {canDelete() && (
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
                    )}
                    {canEdit() && (
                      <button
                        className="edit-btn"
                        onClick={() => setEditingGuest(guest)}
                        title="Edit guest information"
                      >
                        Edit
                      </button>
                    )}
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
