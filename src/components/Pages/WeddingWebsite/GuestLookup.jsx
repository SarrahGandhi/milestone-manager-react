import React, { useState } from "react";
import "./WeddingWebsite.css";

// Use the centralized API configuration
import { getApiUrl } from "../../../config";

const GuestLookup = ({ onGuestFound }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

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

      if (data.guest) {
        onGuestFound(data.guest);
      } else {
        setError(
          "Guest not found. Please check the spelling or contact the hosts."
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

  const handleRetry = () => {
    setError("");
    setName("");
  };

  return (
    <div className="guest-lookup-container">
      <h2>Find Your Invitation</h2>
      <p className="lookup-instruction">
        Please enter your name as it appears on your invitation
      </p>

      <form onSubmit={handleSubmit} className="lookup-form">
        <div className="form-group">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
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
