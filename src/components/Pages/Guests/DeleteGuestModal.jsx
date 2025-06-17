import React, { useState } from "react";
import guestService from "../../../services/guestService";
import "./DeleteGuestModal.css";

const DeleteGuestModal = ({ guest, onGuestDeleted, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Deleting guest:", guest);

      await guestService.deleteGuest(guest._id);

      console.log("Guest deleted successfully");

      // Notify parent component
      if (onGuestDeleted) {
        onGuestDeleted();
      }

      // Close modal
      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error("Error deleting guest:", error);
      setError(error.message || "Failed to delete guest");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setError("");
    if (onCancel) {
      onCancel();
    }
  };

  // Handle clicking outside modal
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  return (
    <div className="delete-guest-modal-overlay" onClick={handleOverlayClick}>
      <div className="delete-guest-modal">
        <div className="delete-guest-modal-header">
          <h2>Confirm Delete</h2>
          <button
            className="close-btn"
            onClick={handleCancel}
            type="button"
            disabled={loading}
          >
            ×
          </button>
        </div>

        <div className="delete-guest-modal-content">
          {error && (
            <div className="error-message">
              {error}
              <button onClick={() => setError("")} className="close-error-btn">
                ×
              </button>
            </div>
          )}

          <div className="guest-info">
            <div className="warning-icon">⚠️</div>
            <h3>Delete Guest</h3>
            <p>Are you sure you want to delete the following guest?</p>

            <div className="guest-details">
              <div className="guest-detail-row">
                <span className="label">Name:</span>
                <span className="value">{guest.name}</span>
              </div>

              {guest.email && (
                <div className="guest-detail-row">
                  <span className="label">Email:</span>
                  <span className="value">{guest.email}</span>
                </div>
              )}

              {guest.phone && (
                <div className="guest-detail-row">
                  <span className="label">Phone:</span>
                  <span className="value">{guest.phone}</span>
                </div>
              )}

              {guest.relationship && (
                <div className="guest-detail-row">
                  <span className="label">Relationship:</span>
                  <span className="value">{guest.relationship}</span>
                </div>
              )}

              {guest.rsvpStatus && (
                <div className="guest-detail-row">
                  <span className="label">RSVP Status:</span>
                  <span
                    className={`value rsvp-${guest.rsvpStatus.toLowerCase()}`}
                  >
                    {guest.rsvpStatus}
                  </span>
                </div>
              )}
            </div>

            <div className="warning-text">
              <p>
                <strong>This action cannot be undone.</strong>
              </p>
              <p>
                All associated RSVP information and event connections will also
                be removed.
              </p>
            </div>
          </div>
        </div>

        <div className="delete-guest-modal-actions">
          <button
            className="delete-btn"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Deleting...
              </>
            ) : (
              "Delete Guest"
            )}
          </button>
          <button
            className="cancel-btn"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteGuestModal;
