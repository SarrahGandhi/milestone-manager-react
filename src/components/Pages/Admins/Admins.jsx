import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import userService from "../../../services/userService";
import AddAdminForm from "./AddAdminForm";
import DeleteAdminModal from "./DeleteAdminModal";
import "./Admins.css";

const Admins = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      setUsers(response || []);
      setError("");
    } catch (error) {
      setError("Failed to load users");
      console.error("Error loading users:", error);
      setUsers([]); // Ensure users is always an array
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
      setError(error.message || "Failed to update user role");
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  if (loading && (!users || users.length === 0)) {
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
        <AddAdminForm
          onUserAdded={loadUsers}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <DeleteAdminModal
          user={userToDelete}
          onUserDeleted={() => {
            setSuccess("User deleted successfully");
            loadUsers();
          }}
          onCancel={() => {
            setShowDeleteModal(false);
            setUserToDelete(null);
          }}
        />
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
            {users &&
              users.map((userItem) => (
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
                      onClick={() => {
                        setUserToDelete(userItem);
                        setShowDeleteModal(true);
                      }}
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

        {users && users.length === 0 && !loading && (
          <div className="no-users">
            <p>No users found.</p>
          </div>
        )}
      </div>

      <div className="users-count">Total Users: {users ? users.length : 0}</div>
    </div>
  );
};

export default Admins;
