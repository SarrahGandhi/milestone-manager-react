import React, { useState, useEffect } from "react";
import AddEventForm from "./AddEventForm";
import EventsList from "./EventsList";
import { getApiUrl } from "../../config";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("events");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    draft: 0,
    published: 0,
  });

  // Fetch events from API
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl("/events"));
      const data = await response.json();
      setEvents(data);

      // Calculate stats
      const today = new Date();
      const stats = {
        total: data.length,
        upcoming: data.filter((event) => new Date(event.eventDate) >= today)
          .length,
        draft: data.filter((event) => event.status === "draft").length,
        published: data.filter((event) => event.status === "published").length,
      };
      setStats(stats);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEventAdded = () => {
    fetchEvents(); // Refresh events list
    setActiveTab("events"); // Switch to events list
  };

  const handleEventDeleted = () => {
    fetchEvents(); // Refresh events list
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-stats">
          <div className="stat-card">
            <h3>{stats.total}</h3>
            <p>Total Events</p>
          </div>
          <div className="stat-card">
            <h3>{stats.upcoming}</h3>
            <p>Upcoming</p>
          </div>
          <div className="stat-card">
            <h3>{stats.draft}</h3>
            <p>Drafts</p>
          </div>
          <div className="stat-card">
            <h3>{stats.published}</h3>
            <p>Published</p>
          </div>
        </div>
      </div>

      <div className="admin-navigation">
        <button
          className={`nav-btn ${activeTab === "events" ? "active" : ""}`}
          onClick={() => setActiveTab("events")}
        >
          Manage Events
        </button>
        <button
          className={`nav-btn ${activeTab === "add-event" ? "active" : ""}`}
          onClick={() => setActiveTab("add-event")}
        >
          Add New Event
        </button>
      </div>

      <div className="admin-content">
        {loading && <div className="loading">Loading...</div>}

        {activeTab === "add-event" && (
          <AddEventForm onEventAdded={handleEventAdded} />
        )}

        {activeTab === "events" && (
          <EventsList
            events={events}
            onEventDeleted={handleEventDeleted}
            onRefresh={fetchEvents}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
