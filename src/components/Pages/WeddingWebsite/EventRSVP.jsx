import React, { useState } from "react";
import "./WeddingWebsite.css";

const EventRSVP = ({ event, guestEvent, onRSVPSubmit }) => {
  const [rsvpData, setRsvpData] = useState({
    rsvpStatus: guestEvent?.rsvpStatus || "pending",
    attendeeCount: {
      men: guestEvent?.attendeeCount?.men || 0,
      women: guestEvent?.attendeeCount?.women || 0,
      kids: guestEvent?.attendeeCount?.kids || 0,
    },
    dietaryRestrictions: guestEvent?.dietaryRestrictions || "",
    specialRequests: guestEvent?.specialRequests || "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    onRSVPSubmit(event._id, rsvpData);
  };

  const handleAttendeeChange = (type, value) => {
    setRsvpData((prev) => ({
      ...prev,
      attendeeCount: {
        ...prev.attendeeCount,
        [type]: parseInt(value) || 0,
      },
    }));
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
      <p className="event-location">{event.location}</p>

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

        {rsvpData.rsvpStatus === "confirmed" && (
          <>
            <div className="attendee-count-section">
              <label>Number of Guests:</label>
              <div className="attendee-inputs">
                <div className="attendee-input-group">
                  <label>Men</label>
                  <input
                    type="number"
                    min="0"
                    value={rsvpData.attendeeCount.men}
                    onChange={(e) =>
                      handleAttendeeChange("men", e.target.value)
                    }
                  />
                </div>
                <div className="attendee-input-group">
                  <label>Women</label>
                  <input
                    type="number"
                    min="0"
                    value={rsvpData.attendeeCount.women}
                    onChange={(e) =>
                      handleAttendeeChange("women", e.target.value)
                    }
                  />
                </div>
                <div className="attendee-input-group">
                  <label>Children</label>
                  <input
                    type="number"
                    min="0"
                    value={rsvpData.attendeeCount.kids}
                    onChange={(e) =>
                      handleAttendeeChange("kids", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

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

        <button type="submit" className="submit-rsvp-btn">
          Submit RSVP
        </button>
      </form>
    </div>
  );
};

export default EventRSVP;
