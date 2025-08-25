import React, { useState, useEffect } from "react";
import GuestLookup from "./GuestLookup";
import EventRSVP from "./EventRSVP";
import "./WeddingWebsite.css";

// Use the centralized API configuration
import { getApiUrl } from "../../../config";

const WeddingWebsite = () => {
  const [guest, setGuest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGuestFound = (foundGuest) => {
    console.log("Found guest:", foundGuest);
    setGuest(foundGuest);
  };

  const handleRSVPSubmit = async (eventId, rsvpData) => {
    try {
      const response = await fetch(
        getApiUrl(`/guests/${guest.id}/events/${eventId}/rsvp`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rsvpStatus: rsvpData.rsvpStatus,
            email: rsvpData.email,
            dietaryRestrictions: rsvpData.dietaryRestrictions,
            specialRequests: rsvpData.specialRequests,
            wantsEmailConfirmation: rsvpData.wantsEmailConfirmation,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit RSVP");
      }

      // Update the guest's event data locally
      setGuest((prevGuest) => ({
        ...prevGuest,
        email: rsvpData.email,
        guestEvents: prevGuest.guestEvents.map((ge) =>
          ge.eventId && ge.eventId.id === eventId ? { ...ge, ...data } : ge
        ),
      }));

      // Show success message with email confirmation info
      const successMessage =
        rsvpData.wantsEmailConfirmation && rsvpData.email
          ? "RSVP submitted successfully! An email confirmation will be sent to your email address."
          : "RSVP submitted successfully!";

      alert(successMessage);
    } catch (err) {
      console.error("Error submitting RSVP:", err);
      alert(err.message || "Failed to submit RSVP. Please try again.");
    }
  };

  const handleRSVPDelete = async (eventId) => {
    try {
      const response = await fetch(
        getApiUrl(`/guests/${guest._id}/events/${eventId}/rsvp`),
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to cancel RSVP");
      }

      // Remove the RSVP from the guest's event data locally
      setGuest((prevGuest) => ({
        ...prevGuest,
        guestEvents: prevGuest.guestEvents.filter(
          (ge) => ge.eventId && ge.eventId._id !== eventId
        ),
      }));

      alert("RSVP cancelled successfully!");
    } catch (err) {
      console.error("Error cancelling RSVP:", err);
      alert(err.message || "Failed to cancel RSVP. Please try again.");
    }
  };

  return (
    <div className="wedding-website">
      <div className="hero-section">
        <h1>Sarrah & Murtaza</h1>
        <p className="date">October 9, 2026</p>
        <p className="tagline">Join us for our special day</p>
      </div>

      {!guest ? (
        <GuestLookup onGuestFound={handleGuestFound} />
      ) : (
        <div className="rsvp-section">
          <h2>Welcome, {guest.name}!</h2>
          <p className="rsvp-instruction">
            Please RSVP for each event you've been invited to:
          </p>

          <div className="events-list">
            {guest.guestEvents && guest.guestEvents.length > 0 ? (
              guest.guestEvents.map((guestEvent) => {
                if (!guestEvent.eventId) return null;

                return (
                  <EventRSVP
                    key={guestEvent.eventId._id}
                    event={guestEvent.eventId}
                    guestEvent={guestEvent}
                    guestEmail={guest.email}
                    onRSVPSubmit={handleRSVPSubmit}
                    onRSVPDelete={handleRSVPDelete}
                  />
                );
              })
            ) : (
              <p className="no-events">
                No events found for your invitation. Please contact the hosts if
                you believe this is an error.
              </p>
            )}
          </div>

          <button
            onClick={() => setGuest(null)}
            className="logout-btn"
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#f0f0f0",
              border: "1px solid #ccc",
              cursor: "pointer",
              borderRadius: "4px",
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default WeddingWebsite;
