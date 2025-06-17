import React, { useState } from "react";
import userService from "../../../services/userService";
import "./AddAdminForm.css";

const AddAdminForm = ({ onUserAdded, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form data for adding new user
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "user",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      console.log("Submitting new user:", newUser);

      const result = await userService.createUser(newUser);
      console.log("User created successfully:", result);

      setSuccess("User created successfully!");

      // Reset form
      setNewUser({
        username: "",
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        role: "user",
      });

      // Notify parent component
      if (onUserAdded) {
        onUserAdded();
      }

      // Auto-close after 2 seconds
      setTimeout(() => {
        if (onCancel) {
          onCancel();
        }
      }, 2000);
    } catch (error) {
      console.error("Error creating user:", error);
      setError(error.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setNewUser({
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "user",
    });
    setError("");
    setSuccess("");

    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="add-admin-form-container">
      <div className="add-admin-form-header">
        <h2>Add New User</h2>
        <button className="close-btn" onClick={handleCancel} type="button">
          ×
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="message error-message">
          {error}
          <button onClick={() => setError("")} className="close-msg-btn">
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="message success-message">
          {success}
          <button onClick={() => setSuccess("")} className="close-msg-btn">
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="add-user-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name *</label>
            <input
              id="firstName"
              type="text"
              value={newUser.firstName}
              onChange={(e) =>
                setNewUser({ ...newUser, firstName: e.target.value })
              }
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name *</label>
            <input
              id="lastName"
              type="text"
              value={newUser.lastName}
              onChange={(e) =>
                setNewUser({ ...newUser, lastName: e.target.value })
              }
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="username">Username *</label>
          <input
            id="username"
            type="text"
            value={newUser.username}
            onChange={(e) =>
              setNewUser({ ...newUser, username: e.target.value })
            }
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            id="email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password *</label>
          <input
            id="password"
            type="password"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
            required
            disabled={loading}
            minLength="6"
          />
          <small className="form-hint">Minimum 6 characters</small>
        </div>

        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            disabled={loading}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Creating..." : "Create User"}
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAdminForm;
