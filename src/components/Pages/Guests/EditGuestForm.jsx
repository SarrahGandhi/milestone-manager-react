import React, { useState, useEffect } from "react";
import "./EditGuestForm.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faUserEdit } from "@fortawesome/free-solid-svg-icons";
import AuthService from "../../../services/authService";

// Use the centralized API configuration
import { getApiUrl } from "../../../config";

const EditGuestForm = ({ guest, onClose, events }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    notes: "",
    selectedEvents: [], // Array of event IDs
    eventAttendees: {}, // Object to store attendee counts per event
    eventStatuses: {}, // Object to store invitation and RSVP status per event
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Populate form with existing guest data
  useEffect(() => {
    if (guest) {
      const eventStatuses = {};
      // Initialize event statuses from guest events
      guest.guestEvents?.forEach((ge) => {
        eventStatuses[ge.eventId._id] = {
          invitationStatus: ge.invitationStatus || "not_sent",
          rsvpStatus: ge.rsvpStatus || "pending",
        };
      });

      setFormData({
        name: guest.name || "",
        phone: guest.phone || "",
        address: guest.address || "",
        city: guest.city || "",
        country: guest.country || "",
        notes: guest.notes || "",
        selectedEvents: guest.selectedEvents?.map((event) => event._id) || [],
        eventAttendees: guest.eventAttendees || {},
        eventStatuses: eventStatuses,
      });
    }
  }, [guest]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (eventId, type, value) => {
    setFormData((prev) => ({
      ...prev,
      eventStatuses: {
        ...prev.eventStatuses,
        [eventId]: {
          ...prev.eventStatuses[eventId],
          [type]: value,
        },
      },
    }));
  };

  const handleEventToggle = (eventId) => {
    setFormData((prev) => {
      const newSelectedEvents = prev.selectedEvents.includes(eventId)
        ? prev.selectedEvents.filter((id) => id !== eventId)
        : [...prev.selectedEvents, eventId];

      // Initialize attendee counts and statuses when event is selected
      const newEventAttendees = { ...prev.eventAttendees };
      const newEventStatuses = { ...prev.eventStatuses };

      if (!prev.selectedEvents.includes(eventId)) {
        newEventAttendees[eventId] = {
          men: 0,
          women: 0,
          kids: 0,
        };
        newEventStatuses[eventId] = {
          invitationStatus: "not_sent",
          rsvpStatus: "pending",
        };
      } else {
        delete newEventAttendees[eventId];
        delete newEventStatuses[eventId];
      }

      return {
        ...prev,
        selectedEvents: newSelectedEvents,
        eventAttendees: newEventAttendees,
        eventStatuses: newEventStatuses,
      };
    });
  };

  const handleAttendeeCountChange = (eventId, category, value) => {
    setFormData((prev) => ({
      ...prev,
      eventAttendees: {
        ...prev.eventAttendees,
        [eventId]: {
          ...prev.eventAttendees[eventId],
          [category]: parseInt(value) || 0,
        },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!formData.name.trim()) {
      setError("Name is required");
      setLoading(false);
      return;
    }

    try {
      const token = AuthService.getToken();

      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      // Update the guest
      const response = await fetch(getApiUrl(`/guests/${guest._id}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          country: formData.country.trim(),
          notes: formData.notes.trim(),
          selectedEvents: formData.selectedEvents,
          eventAttendees: formData.eventAttendees,
          eventStatuses: formData.eventStatuses,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update guest");
      }

      onClose(); // This will refresh the guest list
    } catch (error) {
      console.error("Error updating guest:", error);
      setError(error.message || "Failed to update guest");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="edit-guest-modal">
        <div className="modal-header">
          <h2>
            <FontAwesomeIcon icon={faUserEdit} />
            Edit Guest
          </h2>
          <button className="close-btn" onClick={onClose} disabled={loading}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-guest-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  placeholder="Enter guest name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="Enter street address"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="Enter city"
                />
              </div>

              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="Enter country"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Events Invited To</h3>
            <div className="events-selection">
              {events.length === 0 ? (
                <p className="no-events-message">
                  No events created yet. Create events first to invite guests.
                </p>
              ) : (
                <div className="events-grid">
                  {events.map((event) => (
                    <div key={event._id} className="event-item">
                      <label className="event-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.selectedEvents.includes(event._id)}
                          onChange={() => handleEventToggle(event._id)}
                          disabled={loading}
                        />
                        <span className="event-name">{event.title}</span>
                        <span className="event-date">
                          {new Date(event.eventDate).toLocaleDateString()}
                        </span>
                      </label>

                      {formData.selectedEvents.includes(event._id) && (
                        <div className="event-details">
                          <div className="status-controls">
                            <div className="form-group">
                              <label>Invitation Status</label>
                              <select
                                value={
                                  formData.eventStatuses[event._id]
                                    ?.invitationStatus || "not_sent"
                                }
                                onChange={(e) =>
                                  handleStatusChange(
                                    event._id,
                                    "invitationStatus",
                                    e.target.value
                                  )
                                }
                                disabled={loading}
                              >
                                <option value="not_sent">Not Sent</option>
                                <option value="sent">Sent</option>
                                <option value="delivered">Delivered</option>
                                <option value="opened">Opened</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label>RSVP Status</label>
                              <select
                                value={
                                  formData.eventStatuses[event._id]
                                    ?.rsvpStatus || "pending"
                                }
                                onChange={(e) =>
                                  handleStatusChange(
                                    event._id,
                                    "rsvpStatus",
                                    e.target.value
                                  )
                                }
                                disabled={loading}
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="declined">Declined</option>
                                <option value="maybe">Maybe</option>
                              </select>
                            </div>
                          </div>
                          <div className="attendee-counts">
                            <div className="attendee-input">
                              <label>Men:</label>
                              <input
                                type="number"
                                min="0"
                                value={
                                  formData.eventAttendees[event._id]?.men || 0
                                }
                                onChange={(e) =>
                                  handleAttendeeCountChange(
                                    event._id,
                                    "men",
                                    e.target.value
                                  )
                                }
                                disabled={loading}
                              />
                            </div>
                            <div className="attendee-input">
                              <label>Women:</label>
                              <input
                                type="number"
                                min="0"
                                value={
                                  formData.eventAttendees[event._id]?.women || 0
                                }
                                onChange={(e) =>
                                  handleAttendeeCountChange(
                                    event._id,
                                    "women",
                                    e.target.value
                                  )
                                }
                                disabled={loading}
                              />
                            </div>
                            <div className="attendee-input">
                              <label>Kids:</label>
                              <input
                                type="number"
                                min="0"
                                value={
                                  formData.eventAttendees[event._id]?.kids || 0
                                }
                                onChange={(e) =>
                                  handleAttendeeCountChange(
                                    event._id,
                                    "kids",
                                    e.target.value
                                  )
                                }
                                disabled={loading}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="Add any special notes about this guest..."
                rows="3"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGuestForm;
