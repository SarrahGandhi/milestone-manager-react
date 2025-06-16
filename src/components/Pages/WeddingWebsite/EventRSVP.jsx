import React, { useState } from "react";
import "./WeddingWebsite.css";

const EventRSVP = ({
  event,
  guestEvent,
  onRSVPSubmit,
  onRSVPDelete,
  guestEmail,
}) => {
  const [rsvpData, setRsvpData] = useState({
    rsvpStatus: guestEvent?.rsvpStatus || "pending",
    email: guestEmail || "",
    dietaryRestrictions: guestEvent?.dietaryRestrictions || "",
    specialRequests: guestEvent?.specialRequests || "",
    wantsEmailConfirmation: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic email validation if email confirmation is requested
    if (rsvpData.wantsEmailConfirmation && rsvpData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(rsvpData.email)) {
        alert(
          "Please enter a valid email address or uncheck the email confirmation option."
        );
        return;
      }
    }

    onRSVPSubmit(event._id, rsvpData);
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to cancel your RSVP for "${event.title}"? This action cannot be undone.`
      )
    ) {
      onRSVPDelete(event._id);
    }
  };

  return (
    <div className="event-rsvp-container">
      <h3>{event.title}</h3>
      <p className="event-details">
        {new Date(event.eventDate).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })}
      </p>
      {event.location && <p className="event-location">{event.location}</p>}

      {guestEvent?.rsvpStatus && guestEvent.rsvpStatus !== "pending" && (
        <div className="current-rsvp-status">
          <p>
            <strong>Current RSVP Status:</strong> {guestEvent.rsvpStatus}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="rsvp-form">
        <div className="form-group">
          <label>Will you attend?</label>
          <select
            value={rsvpData.rsvpStatus}
            onChange={(e) =>
              setRsvpData((prev) => ({ ...prev, rsvpStatus: e.target.value }))
            }
            className="rsvp-select"
          >
            <option value="pending">Please Select</option>
            <option value="confirmed">Yes, I will attend</option>
            <option value="declined">No, I cannot attend</option>
            <option value="maybe">Maybe</option>
          </select>
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            value={rsvpData.email}
            onChange={(e) =>
              setRsvpData((prev) => ({ ...prev, email: e.target.value }))
            }
            placeholder="your.email@example.com"
            className="email-input"
          />
          <small className="email-help-text">
            {rsvpData.wantsEmailConfirmation
              ? "Required for email confirmation"
              : "Optional - for any future wedding updates"}
          </small>
        </div>

        {rsvpData.rsvpStatus === "confirmed" && (
          <>
            <div className="form-group">
              <label>Dietary Restrictions</label>
              <textarea
                value={rsvpData.dietaryRestrictions}
                onChange={(e) =>
                  setRsvpData((prev) => ({
                    ...prev,
                    dietaryRestrictions: e.target.value,
                  }))
                }
                placeholder="Please list any dietary restrictions or allergies"
              />
            </div>

            <div className="form-group">
              <label>Special Requests</label>
              <textarea
                value={rsvpData.specialRequests}
                onChange={(e) =>
                  setRsvpData((prev) => ({
                    ...prev,
                    specialRequests: e.target.value,
                  }))
                }
                placeholder="Any special requests or notes"
              />
            </div>
          </>
        )}

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={rsvpData.wantsEmailConfirmation}
              onChange={(e) =>
                setRsvpData((prev) => ({
                  ...prev,
                  wantsEmailConfirmation: e.target.checked,
                }))
              }
              className="email-confirmation-checkbox"
            />
            <span className="checkbox-text">
              Send me an email confirmation of my RSVP
            </span>
          </label>
        </div>

        <button type="submit" className="submit-rsvp-btn">
          {guestEvent?.rsvpStatus && guestEvent.rsvpStatus !== "pending"
            ? "Update RSVP"
            : "Submit RSVP"}
        </button>

        {guestEvent?.rsvpStatus && guestEvent.rsvpStatus !== "pending" && (
          <button
            type="button"
            className="cancel-rsvp-btn"
            onClick={handleDelete}
          >
            Cancel RSVP
          </button>
        )}
      </form>
    </div>
  );
};

export default EventRSVP;
