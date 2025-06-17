import React, { useState } from "react";
import "./WeddingWebsite.css";

// Use the centralized API configuration
import { getApiUrl } from "../../../config";

const GuestLookup = ({ onGuestFound }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setSearchResults([]);
    setShowResults(false);

    try {
      const response = await fetch(
        getApiUrl(`/guests/lookup?name=${encodeURIComponent(name)}`),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to find guest");
      }

      // Handle single guest result (backward compatibility)
      if (data.guest) {
        onGuestFound(data.guest);
      }
      // Handle multiple guests result
      else if (data.guests && data.guests.length > 0) {
        setSearchResults(data.guests);
        setShowResults(true);
      } else {
        setError(
          "No guests found matching your search. Please try a different name or contact the hosts."
        );
      }
    } catch (err) {
      console.error("Error looking up guest:", err);
      setError(
        err.message || "An error occurred while looking up your invitation"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSelect = (guest) => {
    onGuestFound(guest);
    setSearchResults([]);
    setShowResults(false);
  };

  const handleRetry = () => {
    setError("");
    setName("");
    setSearchResults([]);
    setShowResults(false);
  };

  const handleNewSearch = () => {
    setSearchResults([]);
    setShowResults(false);
    setError("");
  };

  if (showResults && searchResults.length > 0) {
    return (
      <div className="guest-lookup-container">
        <h2>Multiple Guests Found</h2>
        <p className="lookup-instruction">
          We found {searchResults.length} guest
          {searchResults.length > 1 ? "s" : ""} matching "{name}". Please select
          your name:
        </p>

        <div className="search-results">
          {searchResults.map((guest) => (
            <div
              key={guest._id}
              className={`guest-result-card ${
                !guest.hasEvents ? "no-events" : ""
              }`}
              onClick={() => guest.hasEvents && handleGuestSelect(guest)}
            >
              <h3>{guest.name}</h3>
              {guest.hasEvents ? (
                <p className="guest-events">
                  Invited to:{" "}
                  {guest.selectedEvents
                    ?.map((event) => event.title)
                    .join(", ") || "Loading events..."}
                </p>
              ) : (
                <p className="guest-events no-events-text">
                  No active invitations found
                </p>
              )}
              {guest.address && (
                <p className="guest-address">
                  {guest.city}, {guest.country}
                </p>
              )}
              {!guest.hasEvents && (
                <p className="guest-warning">
                  This guest has no active invitations. Contact the hosts if
                  this is your entry.
                </p>
              )}
            </div>
          ))}
        </div>

        <button onClick={handleNewSearch} className="new-search-btn">
          Search Again
        </button>
      </div>
    );
  }

  return (
    <div className="guest-lookup-container">
      <h2>Find Your Invitation</h2>
      <p className="lookup-instruction">
        Enter your first name or full name to find your invitation
      </p>

      <form onSubmit={handleSubmit} className="lookup-form">
        <div className="form-group">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your first name or full name"
            required
            className="lookup-input"
            disabled={loading}
          />
        </div>

        <button type="submit" className="lookup-btn" disabled={loading}>
          {loading ? "Searching..." : "Find Invitation"}
        </button>
      </form>

      {error && (
        <div className="lookup-error">
          {error}
          <button onClick={handleRetry} className="retry-btn">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default GuestLookup;
