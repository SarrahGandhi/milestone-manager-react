import React, { useState, useEffect } from "react";
import GuestLookup from "./GuestLookup";
import EventRSVP from "./EventRSVP";
import "./WeddingWebsite.css";

// Use the same API base URL configuration
const API_BASE_URL = "http://localhost:5001/api";

const WeddingWebsite = () => {
  const [guest, setGuest] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch events when component mounts
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/events/upcoming`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from server:", errorData);
        throw new Error(errorData.message || "Failed to fetch events");
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        setError("No upcoming events found. Please check back later.");
        setEvents([]);
        return;
      }

      // Sort events by date if needed (though backend should handle this)
      const sortedEvents = data.sort(
        (a, b) => new Date(a.eventDate) - new Date(b.eventDate)
      );
      setEvents(sortedEvents);
      setError("");
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(
        "We're having trouble loading the events. Please try again in a few moments."
      );
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestFound = (foundGuest) => {
    setGuest(foundGuest);
  };

  const handleRSVPSubmit = async (eventId, rsvpData) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/guests/${guest._id}/events/${eventId}/rsvp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(rsvpData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit RSVP");
      }

      // Update the guest's event data
      setGuest((prevGuest) => ({
        ...prevGuest,
        guestEvents: prevGuest.guestEvents.map((ge) =>
          ge.eventId._id === eventId ? { ...ge, ...rsvpData } : ge
        ),
      }));

      alert("RSVP submitted successfully!");
    } catch (err) {
      console.error("Error submitting RSVP:", err);
      alert(err.message || "Failed to submit RSVP. Please try again.");
    }
  };

  if (loading) {
    return <div className="loading">Loading events...</div>;
  }

  if (error) {
    return (
      <div className="error">
        {error}
        <button onClick={fetchEvents} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="wedding-website">
      <div className="hero-section">
        <h1>Sarah & John</h1>
        <p className="date">August 15, 2024</p>
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
            {guest.selectedEvents?.map((eventId) => {
              const event = events.find((e) => e._id === eventId);
              const guestEvent = guest.guestEvents?.find(
                (ge) => ge.eventId._id === eventId
              );

              if (!event) return null;

              return (
                <EventRSVP
                  key={event._id}
                  event={event}
                  guestEvent={guestEvent}
                  onRSVPSubmit={handleRSVPSubmit}
                />
              );
            })}
          </div>
        </div>
      )}

      <section className="details-section">
        <div className="detail-card">
          <h2>The Ceremony</h2>
          <p>4:00 PM</p>
          <p>St. Mary's Church</p>
          <p>123 Wedding Lane</p>
          <p>San Francisco, CA 94105</p>
        </div>

        <div className="detail-card">
          <h2>The Reception</h2>
          <p>6:00 PM</p>
          <p>Golden Gate Club</p>
          <p>456 Reception Road</p>
          <p>San Francisco, CA 94105</p>
        </div>
      </section>

      <section className="timeline-section">
        <h2>Our Story</h2>
        <div className="timeline">
          <div className="timeline-item">
            <h3>First Met</h3>
            <p>Spring 2020</p>
          </div>
          <div className="timeline-item">
            <h3>First Date</h3>
            <p>Summer 2020</p>
          </div>
          <div className="timeline-item">
            <h3>Engagement</h3>
            <p>Winter 2023</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WeddingWebsite;
