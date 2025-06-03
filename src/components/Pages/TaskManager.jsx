import React, { useState, useEffect } from "react";
import TaskService from "../../services/taskService";
import AddTaskForm from "./AddTaskForm";
import "./TaskManager.css";

// Remove the hardcoded initialTasks array and just define the categories and months
const months = ["June", "July", "August", "October", "November"];
const categories = ["Budget", "Venue", "Vendors", "Planning", "Other"];

// Enhanced color scheme with better gradients and category icons
const categoryConfig = {
  Budget: {
    gradient: "linear-gradient(135deg, #eb9895 0%, #f3b6b3 100%)",
    icon: "💰",
    color: "#eb9895",
  },
  Venue: {
    gradient: "linear-gradient(135deg, #f3b6b3 0%, #eb9895 100%)",
    icon: "🏛️",
    color: "#f3b6b3",
  },
  Vendors: {
    gradient: "linear-gradient(135deg, #e8b4bc 0%, #eb9895 100%)",
    icon: "🤝",
    color: "#e8b4bc",
  },
  Planning: {
    gradient: "linear-gradient(135deg, #f7d6e0 0%, #eb9895 100%)",
    icon: "📋",
    color: "#f7d6e0",
  },
  Other: {
    gradient: "linear-gradient(135deg, #eb9895 0%, #f3b6b3 100%)",
    icon: "📌",
    color: "#eb9895",
  },
};

const monthConfig = {
  June: {
    gradient: "linear-gradient(135deg, #eb9895 0%, #f7d6e0 100%)",
    icon: "🌸",
    color: "#eb9895",
  },
  July: {
    gradient: "linear-gradient(135deg, #f3b6b3 0%, #e8b4bc 100%)",
    icon: "☀️",
    color: "#f3b6b3",
  },
  August: {
    gradient: "linear-gradient(135deg, #e8b4bc 0%, #eb9895 100%)",
    icon: "🌺",
    color: "#e8b4bc",
  },
  October: {
    gradient: "linear-gradient(135deg, #f7d6e0 0%, #eb9895 100%)",
    icon: "🍂",
    color: "#f7d6e0",
  },
  November: {
    gradient: "linear-gradient(135deg, #eb9895 0%, #f3b6b3 100%)",
    icon: "🍁",
    color: "#eb9895",
  },
};

const priorityConfig = {
  high: { color: "#ff6b6b", label: "High Priority", icon: "🔴" },
  medium: { color: "#ffa726", label: "Medium Priority", icon: "🟡" },
  low: { color: "#66bb6a", label: "Low Priority", icon: "🟢" },
};

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [monthFilter, setMonthFilter] = useState("ALL Months");
  const [sortMode, setSortMode] = useState("category");
  const [openGroup, setOpenGroup] = useState(categories[0]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Load tasks from database on component mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const tasksData = await TaskService.getAllTasks();
      // Convert database dates to month names for filtering
      const tasksWithMonths = tasksData.map((task) => ({
        ...task,
        month: new Date(task.dueDate).toLocaleString("default", {
          month: "long",
        }),
        due: new Date(task.dueDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      }));
      setTasks(tasksWithMonths);
    } catch (err) {
      setError("Failed to load tasks. Please try again.");
      console.error("Error loading tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCompleted = () => setShowCompleted((prev) => !prev);

  const handleDelete = async (id) => {
    try {
      await TaskService.deleteTask(id);
      setTasks(tasks.filter((t) => t._id !== id));
      if (selectedTask && selectedTask._id === id) {
        handleClosePanel();
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      setError("Failed to delete task. Please try again.");
    }
  };

  const handleCheck = async (id) => {
    try {
      const updatedTask = await TaskService.toggleTaskCompletion(id);
      const taskWithMonth = {
        ...updatedTask,
        month: new Date(updatedTask.dueDate).toLocaleString("default", {
          month: "long",
        }),
        due: new Date(updatedTask.dueDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      };
      setTasks(tasks.map((t) => (t._id === id ? taskWithMonth : t)));

      // Update selected task if it's the one being modified
      if (selectedTask && selectedTask._id === id) {
        setSelectedTask(taskWithMonth);
      }
    } catch (error) {
      console.error("Error toggling task completion:", error);
      setError("Failed to update task. Please try again.");
    }
  };

  const handleOpenDetails = (task) => {
    setSelectedTask(task);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setSelectedTask(null);
  };

  const handleOpenAddForm = () => {
    setShowAddForm(true);
  };

  const handleCloseAddForm = () => {
    setShowAddForm(false);
  };

  const handleTaskAdded = (newTask) => {
    const taskWithMonth = {
      ...newTask,
      month: new Date(newTask.dueDate).toLocaleString("default", {
        month: "long",
      }),
      due: new Date(newTask.dueDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };
    setTasks((prev) => [...prev, taskWithMonth]);
  };

  // Group tasks by category or month
  const groupKeys = sortMode === "category" ? categories : months;
  const groupBy = sortMode === "category" ? "category" : "month";

  const groupedTasks = groupKeys.reduce((acc, key) => {
    acc[key] = tasks.filter(
      (task) =>
        task[groupBy] === key &&
        (showCompleted || !task.completed) &&
        (monthFilter === "ALL Months" || task.month === monthFilter)
    );
    return acc;
  }, {});

  // Only show groups that match the filter or ALL
  const visibleGroups =
    sortMode === "month"
      ? monthFilter === "ALL Months"
        ? months
        : [monthFilter]
      : groupKeys;

  // When switching sort mode, open the first group by default
  const handleSortMode = (mode) => {
    setSortMode(mode);
    setOpenGroup(mode === "category" ? categories[0] : months[0]);
  };

  const getGroupConfig = (group) => {
    return sortMode === "category" ? categoryConfig[group] : monthConfig[group];
  };

  const getTaskCount = (group) => {
    return groupedTasks[group]?.length || 0;
  };

  const getCompletedCount = (group) => {
    return groupedTasks[group]?.filter((task) => task.completed).length || 0;
  };

  // Loading state
  if (loading) {
    return (
      <div className="taskmanager-root">
        <div className="taskmanager-header">
          <h1 className="taskmanager-title">
            <span className="title-icon">📋</span>
            Task Manager
          </h1>
          <p className="taskmanager-subtitle">Loading tasks...</p>
        </div>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div style={{ fontSize: "2rem" }}>⏳</div>
          <p>Loading your tasks...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="taskmanager-root">
        <div className="taskmanager-header">
          <h1 className="taskmanager-title">
            <span className="title-icon">📋</span>
            Task Manager
          </h1>
          <p className="taskmanager-subtitle">Error loading tasks</p>
        </div>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div style={{ color: "#ff6b6b", fontSize: "2rem" }}>⚠️</div>
          <p style={{ color: "#ff6b6b" }}>{error}</p>
          <button
            onClick={loadTasks}
            style={{
              background: "#eb9895",
              color: "white",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="taskmanager-root">
      <div className="taskmanager-header">
        <h1 className="taskmanager-title">
          <span className="title-icon">📋</span>
          Task Manager
        </h1>
        <p className="taskmanager-subtitle">
          Organize and track your wedding planning tasks
        </p>
      </div>

      <div className="taskmanager-controls">
        <div className="control-group">
          <label className="control-label">Filter by Month</label>
          <select
            className="month-filter"
            value={monthFilter}
            onChange={(e) => {
              setMonthFilter(e.target.value);
              if (sortMode === "month" && e.target.value !== "ALL Months")
                setOpenGroup(e.target.value);
            }}
          >
            <option>ALL Months</option>
            {months.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={handleToggleCompleted}
            />
            <span className="toggle-slider" />
            <span className="toggle-text">Show Completed Tasks</span>
          </label>
        </div>

        <button className="add-task-btn" onClick={handleOpenAddForm}>
          <span className="btn-icon">➕</span>
          Add New Task
        </button>

        <div className="sort-btns">
          <button
            className={`sort-btn${sortMode === "category" ? " active" : ""}`}
            onClick={() => handleSortMode("category")}
          >
            <span className="btn-icon">📂</span>
            By Category
          </button>
          <button
            className={`sort-btn${sortMode === "month" ? " active" : ""}`}
            onClick={() => handleSortMode("month")}
          >
            <span className="btn-icon">📅</span>
            By Month
          </button>
        </div>
      </div>

      <div className="taskmanager-stats">
        <div className="stat-card">
          <div className="stat-number">
            {tasks.filter((t) => !t.completed).length}
          </div>
          <div className="stat-label">Pending Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {tasks.filter((t) => t.completed).length}
          </div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {tasks.filter((t) => t.priority === "high").length}
          </div>
          <div className="stat-label">High Priority</div>
        </div>
      </div>

      <div className="taskmanager-list-section">
        {visibleGroups.map((group) => {
          const config = getGroupConfig(group);
          const taskCount = getTaskCount(group);
          const completedCount = getCompletedCount(group);

          return (
            <div
              className={`taskmanager-list-group${
                openGroup === group ? "" : " collapsed"
              }`}
              key={group}
            >
              <div
                className="taskmanager-list-header"
                style={{
                  background: config.gradient,
                }}
                onClick={() => setOpenGroup(openGroup === group ? null : group)}
              >
                <div className="header-content">
                  <span className="header-icon">{config.icon}</span>
                  <div className="header-text">
                    <span className="header-title">
                      {group} {sortMode === "category" ? "Tasks" : "Tasks"}
                    </span>
                    <span className="header-count">
                      {taskCount} tasks{" "}
                      {completedCount > 0 && `• ${completedCount} completed`}
                    </span>
                  </div>
                </div>
                <span className="expand-arrow">
                  {openGroup === group ? "▼" : "▶"}
                </span>
              </div>

              {openGroup === group && (
                <div className="taskmanager-list">
                  {groupedTasks[group].length > 0 ? (
                    groupedTasks[group].map((task) => (
                      <div
                        className={`taskmanager-task-card${
                          task.completed ? " completed" : ""
                        }`}
                        key={task._id}
                      >
                        <div className="task-checkbox-wrapper">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => handleCheck(task._id)}
                            className="task-checkbox"
                          />
                        </div>

                        <div className="task-content">
                          <div className="task-header">
                            <h3 className="task-title">{task.title}</h3>
                            <div className="task-priority">
                              <span className="priority-icon">
                                {priorityConfig[task.priority].icon}
                              </span>
                              <span className="priority-text">
                                {priorityConfig[task.priority].label}
                              </span>
                            </div>
                          </div>

                          <p className="task-description">{task.description}</p>

                          <div className="task-meta">
                            <div className="task-due">
                              <span className="due-icon">📅</span>
                              Due {task.due}
                            </div>
                            <div className="task-category">
                              <span className="category-icon">
                                {categoryConfig[task.category].icon}
                              </span>
                              {task.category}
                            </div>
                          </div>
                        </div>

                        <div className="task-actions">
                          <button
                            className="task-details-btn"
                            onClick={() => handleOpenDetails(task)}
                          >
                            <span className="btn-icon">👁️</span>
                            Details
                          </button>
                          <button
                            className="task-delete-btn"
                            onClick={() => handleDelete(task._id)}
                          >
                            <span className="btn-icon">🗑️</span>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">📝</div>
                      <div className="empty-text">
                        No tasks for this{" "}
                        {sortMode === "category" ? "category" : "month"}.
                      </div>
                      <button
                        className="empty-add-btn"
                        onClick={handleOpenAddForm}
                      >
                        <span className="btn-icon">➕</span>
                        Add your first task
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Slide-out Details Panel */}
      {isPanelOpen && (
        <>
          <div className="panel-overlay" onClick={handleClosePanel}></div>
          <div className={`details-panel ${isPanelOpen ? "open" : ""}`}>
            <div className="panel-header">
              <h2>Task Details</h2>
              <button className="close-btn" onClick={handleClosePanel}>
                <span className="btn-icon">✕</span>
              </button>
            </div>

            {selectedTask && (
              <div className="panel-content">
                <div className="detail-section">
                  <h3>Task Title</h3>
                  <p>{selectedTask.title}</p>
                </div>

                <div className="detail-section">
                  <h3>Description</h3>
                  <p>{selectedTask.description}</p>
                </div>

                <div className="detail-section">
                  <h3>Due Date</h3>
                  <p>{selectedTask.due}</p>
                </div>

                <div className="detail-section">
                  <h3>Category</h3>
                  <div className="category-badge">
                    <span className="category-icon">
                      {categoryConfig[selectedTask.category].icon}
                    </span>
                    {selectedTask.category}
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Priority</h3>
                  <div className="priority-badge">
                    <span className="priority-icon">
                      {priorityConfig[selectedTask.priority].icon}
                    </span>
                    {priorityConfig[selectedTask.priority].label}
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Status</h3>
                  <div
                    className={`status-badge ${
                      selectedTask.completed ? "completed" : "pending"
                    }`}
                  >
                    {selectedTask.completed ? "✅ Completed" : "⏳ Pending"}
                  </div>
                </div>

                <div className="panel-actions">
                  <button
                    className="edit-task-btn"
                    onClick={() => {
                      // TODO: Implement edit functionality
                      console.log("Edit task:", selectedTask._id);
                    }}
                  >
                    <span className="btn-icon">✏️</span>
                    Edit Task
                  </button>

                  <button
                    className="toggle-complete-btn"
                    onClick={() => {
                      handleCheck(selectedTask._id);
                      // Update the selected task state to reflect the change
                      setSelectedTask({
                        ...selectedTask,
                        completed: !selectedTask.completed,
                      });
                    }}
                  >
                    <span className="btn-icon">
                      {selectedTask.completed ? "↩️" : "✅"}
                    </span>
                    {selectedTask.completed
                      ? "Mark Incomplete"
                      : "Mark Complete"}
                  </button>

                  <button
                    className="delete-task-btn"
                    onClick={() => {
                      handleDelete(selectedTask._id);
                      handleClosePanel();
                    }}
                  >
                    <span className="btn-icon">🗑️</span>
                    Delete Task
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Task Form Modal */}
      {showAddForm && (
        <AddTaskForm
          onClose={handleCloseAddForm}
          onTaskAdded={handleTaskAdded}
        />
      )}
    </div>
  );
};

export default TaskManager;
