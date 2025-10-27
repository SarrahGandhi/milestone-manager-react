import React, { useState } from "react";
import userService from "../../../services/userService";
import "./DeleteAdminModal.css";

const DeleteAdminModal = ({ user, onUserDeleted, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Deleting user:", user);

      // Handle both _id and id formats
      const userId = user._id || user.id;
      await userService.deleteUser(userId);

      console.log("User deleted successfully");

      // Notify parent component
      if (onUserDeleted) {
        onUserDeleted();
      }

      // Close modal
      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setError(error.message || "Failed to delete user");
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
    <div className="delete-admin-modal-overlay" onClick={handleOverlayClick}>
      <div className="delete-admin-modal">
        <div className="delete-admin-modal-header">
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

        <div className="delete-admin-modal-content">
          {error && (
            <div className="error-message">
              {error}
              <button onClick={() => setError("")} className="close-error-btn">
                ×
              </button>
            </div>
          )}

          <div className="model-user-info">
            <div className="warning-icon">⚠️</div>
            <h3>Delete User</h3>
            <p>Are you sure you want to delete the following user?</p>

            <div className="user-details">
              <div className="user-detail-row">
                <span className="label">Name:</span>
                <span className="value">
                  {user.firstName} {user.lastName}
                </span>
              </div>

              <div className="user-detail-row">
                <span className="label">Username:</span>
                <span className="value">{user.username}</span>
              </div>

              <div className="user-detail-row">
                <span className="label">Email:</span>
                <span className="value">{user.email}</span>
              </div>

              <div className="user-detail-row">
                <span className="label">Role:</span>
                <span className={`value role-${user.role.toLowerCase()}`}>
                  {user.role}
                </span>
              </div>

              {user.createdAt && (
                <div className="user-detail-row">
                  <span className="label">Created:</span>
                  <span className="value">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}

              {user.lastLogin && (
                <div className="user-detail-row">
                  <span className="label">Last Login:</span>
                  <span className="value">
                    {new Date(user.lastLogin).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div className="warning-text">
              <p>
                <strong>This action cannot be undone.</strong>
              </p>
              <p>
                All associated data including tasks, events, and other
                user-created content will be affected.
              </p>
              <p>
                Consider changing the user's role instead of deleting their
                account.
              </p>
            </div>
          </div>
        </div>

        <div className="delete-admin-modal-actions">
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
              "Delete User"
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

export default DeleteAdminModal;
