import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import userService from "../../../services/userService";
import "./Admins.css";

const Admins = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Form data for adding new user
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "user",
  });

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      setUsers(response.users);
      setError("");
    } catch (error) {
      setError("Failed to load users");
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await userService.createUser(newUser);
      setSuccess("User created successfully");
      setNewUser({
        username: "",
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        role: "user",
      });
      setShowAddForm(false);
      loadUsers();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setLoading(true);
      await userService.updateUserRole(userId, newRole);
      setSuccess("User role updated successfully");
      loadUsers();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update user role");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      setLoading(true);
      await userService.deleteUser(userId);
      setSuccess("User deleted successfully");
      setDeleteConfirm(null);
      loadUsers();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  if (loading && users.length === 0) {
    return (
      <div className="admins-container">
        <div className="loading">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="admins-container">
      <div className="admins-header">
        <h1>User Management</h1>
        <button
          className="add-user-btn"
          onClick={() => {
            setShowAddForm(true);
            clearMessages();
          }}
        >
          Add New User
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="message error-message">
          {error}
          <button onClick={clearMessages} className="close-btn">
            ×
          </button>
        </div>
      )}
      {success && (
        <div className="message success-message">
          {success}
          <button onClick={clearMessages} className="close-btn">
            ×
          </button>
        </div>
      )}

      {/* Add User Form */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New User</h2>
              <button
                className="close-modal-btn"
                onClick={() => setShowAddForm(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddUser} className="add-user-form">
              <div className="form-group">
                <label>Username:</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>First Name:</label>
                <input
                  type="text"
                  value={newUser.firstName}
                  onChange={(e) =>
                    setNewUser({ ...newUser, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name:</label>
                <input
                  type="text"
                  value={newUser.lastName}
                  onChange={(e) =>
                    setNewUser({ ...newUser, lastName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Role:</label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
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
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Confirm Delete</h2>
            </div>
            <div className="modal-content">
              <p>
                Are you sure you want to delete user:{" "}
                <strong>
                  {deleteConfirm.firstName} {deleteConfirm.lastName}
                </strong>
                ?
              </p>
              <p>This action cannot be undone.</p>
            </div>
            <div className="form-actions">
              <button
                className="delete-btn"
                onClick={() => handleDeleteUser(deleteConfirm._id)}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
              <button
                className="cancel-btn"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((userItem) => (
              <tr key={userItem._id}>
                <td>
                  {userItem.firstName} {userItem.lastName}
                </td>
                <td>{userItem.username}</td>
                <td>{userItem.email}</td>
                <td>
                  <select
                    value={userItem.role}
                    onChange={(e) =>
                      handleRoleChange(userItem._id, e.target.value)
                    }
                    disabled={userItem._id === user._id || loading}
                    className="role-select"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>{new Date(userItem.createdAt).toLocaleDateString()}</td>
                <td>
                  {userItem.lastLogin
                    ? new Date(userItem.lastLogin).toLocaleDateString()
                    : "Never"}
                </td>
                <td>
                  <button
                    className="delete-user-btn"
                    onClick={() => setDeleteConfirm(userItem)}
                    disabled={userItem._id === user._id || loading}
                    title={
                      userItem._id === user._id
                        ? "Cannot delete your own account"
                        : "Delete user"
                    }
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && !loading && (
          <div className="no-users">
            <p>No users found.</p>
          </div>
        )}
      </div>

      <div className="users-count">Total Users: {users.length}</div>
    </div>
  );
};

export default Admins;
