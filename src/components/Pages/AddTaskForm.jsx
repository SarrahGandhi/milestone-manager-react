import React, { useState, useEffect } from "react";
import TaskService from "../../services/taskService";
import userService from "../../services/userService";

const AddTaskForm = ({ onClose, onTaskAdded, isOpen }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    category: "Other",
    priority: "medium",
    estimatedTime: "",
    assignedTo: "",
    tags: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const categories = ["Budget", "Venue", "Vendors", "Planning", "Other"];
  const priorities = ["low", "medium", "high"];

  // Load users when component mounts
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        const allUsers = await userService.getAllUsers();
        // Ensure we always set an array, even if the API returns something unexpected
        setUsers(Array.isArray(allUsers) ? allUsers : []);
      } catch (err) {
        console.error("Failed to load users:", err);
        // Set empty array on error
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare task data
      const taskData = {
        ...formData,
        estimatedTime: formData.estimatedTime
          ? parseInt(formData.estimatedTime)
          : undefined,
        tags: formData.tags
          ? formData.tags.split(",").map((tag) => tag.trim())
          : [],
      };

      // Remove empty fields
      Object.keys(taskData).forEach((key) => {
        if (taskData[key] === "" || taskData[key] === undefined) {
          delete taskData[key];
        }
      });

      const newTask = await TaskService.createTask(taskData);
      onTaskAdded(newTask);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isOpen && <div className="panel-overlay" onClick={onClose}></div>}
      <div className={`add-task-panel ${isOpen ? "open" : ""}`}>
        <div className="panel-header">
          <h2>Add New Task</h2>
          <button className="close-btn" onClick={onClose}>
            <span className="btn-icon">✕</span>
          </button>
        </div>

        <div className="panel-content">
          <form onSubmit={handleSubmit} className="task-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="title">Task Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter task title"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter task description"
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dueDate">Due Date *</label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  {priorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="estimatedTime">Estimated Time (hours)</label>
                <input
                  type="number"
                  id="estimatedTime"
                  name="estimatedTime"
                  value={formData.estimatedTime}
                  onChange={handleChange}
                  min="0"
                  step="0.5"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="assignedTo">Assigned To</label>
              <select
                id="assignedTo"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                disabled={loadingUsers}
              >
                <option value="">Select a team member (optional)</option>
                {Array.isArray(users) &&
                  users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.firstName} {user.lastName} ({user.username})
                    </option>
                  ))}
              </select>
              {loadingUsers && <small>Loading team members...</small>}
            </div>

            <div className="form-group">
              <label htmlFor="tags">Tags (comma separated)</label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="wedding, planning, urgent"
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Creating..." : "Create Task"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .panel-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 998;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .add-task-panel {
          position: fixed;
          top: 0;
          right: -500px;
          width: 500px;
          height: 100vh;
          background: #ffffff;
          box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
          z-index: 999;
          transition: right 0.3s ease-out;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .add-task-panel.open {
          right: 0;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
          position: sticky;
          top: 0;
          z-index: 1;
        }

        .panel-header h2 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
        }

        .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
          color: #6b7280;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          background: #e5e7eb;
          color: #374151;
        }

        .close-btn .btn-icon {
          font-size: 1rem;
          font-weight: bold;
        }

        .panel-content {
          padding: 2rem;
          flex: 1;
        }

        .task-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
          color: #111827;
          transition: all 0.2s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #374151;
          box-shadow: 0 0 0 2px rgba(55, 65, 81, 0.1);
        }

        .form-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #e5e7eb;
        }

        .btn-primary,
        .btn-secondary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid;
        }

        .btn-primary {
          background: #374151;
          border-color: #374151;
          color: #ffffff;
        }

        .btn-primary:hover:not(:disabled) {
          background: #4b5563;
          border-color: #4b5563;
        }

        .btn-primary:disabled {
          background: #9ca3af;
          border-color: #9ca3af;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #f3f4f6;
          border-color: #e5e7eb;
          color: #374151;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
          color: #111827;
        }

        .error-message {
          padding: 0.75rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #dc2626;
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .add-task-panel {
            width: 100%;
            right: -100%;
          }

          .panel-header {
            padding: 1rem 1.5rem;
          }

          .panel-content {
            padding: 1.5rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
};

export default AddTaskForm;
