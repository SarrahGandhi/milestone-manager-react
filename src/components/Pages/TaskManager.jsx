import React, { useState } from "react";
import "./TaskManager.css";

const initialTasks = [
  {
    id: 1,
    title: "Research and estimate costs for major budget items",
    due: "June 15, 2025",
    month: "June",
    category: "Budget",
    completed: false,
    priority: "high",
    description:
      "Create detailed budget breakdown for venue, catering, and decorations",
  },
  {
    id: 2,
    title: "Book Wedding Venue",
    due: "July 15, 2025",
    month: "July",
    category: "Venue",
    completed: false,
    priority: "high",
    description: "Finalize venue booking and sign contract",
  },
  {
    id: 3,
    title: "Order Rentals",
    due: "August 15, 2025",
    month: "August",
    category: "Vendors",
    completed: false,
    priority: "medium",
    description: "Order tables, chairs, linens, and other rental items",
  },
  {
    id: 4,
    title: "Explore and tour Venues",
    due: "November 15, 2025",
    month: "November",
    category: "Venue",
    completed: false,
    priority: "medium",
    description: "Visit potential venues and compare options",
  },
  {
    id: 5,
    title: "Book Engagement Venue",
    due: "October 15, 2025",
    month: "October",
    category: "Venue",
    completed: false,
    priority: "low",
    description: "Secure venue for engagement party",
  },
];

const months = ["June", "July", "August", "October", "November"];
const categories = ["Budget", "Venue", "Vendors"];

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
  const [tasks, setTasks] = useState(initialTasks);
  const [showCompleted, setShowCompleted] = useState(false);
  const [monthFilter, setMonthFilter] = useState("ALL Months");
  const [sortMode, setSortMode] = useState("category");
  const [openGroup, setOpenGroup] = useState(categories[0]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleToggleCompleted = () => setShowCompleted((prev) => !prev);
  const handleDelete = (id) => setTasks(tasks.filter((t) => t.id !== id));
  const handleCheck = (id) =>
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );

  const handleOpenDetails = (task) => {
    setSelectedTask(task);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setSelectedTask(null);
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

        <button className="add-task-btn">
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
                        key={task.id}
                      >
                        <div className="task-checkbox-wrapper">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => handleCheck(task.id)}
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
                            onClick={() => handleDelete(task.id)}
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
                      <button className="empty-add-btn">
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
                      console.log("Edit task:", selectedTask.id);
                    }}
                  >
                    <span className="btn-icon">✏️</span>
                    Edit Task
                  </button>

                  <button
                    className="toggle-complete-btn"
                    onClick={() => {
                      handleCheck(selectedTask.id);
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
                      handleDelete(selectedTask.id);
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
    </div>
  );
};

export default TaskManager;
