import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import TaskService from "../../services/taskService";
import GuestService from "../../services/guestService";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalGuests: 0,
    totalRSVPs: 0,
    totalTasks: 0,
    pendingTasks: 0,
  });
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Function to fetch stats from backend
  const fetchStats = async () => {
    try {
      console.log("Fetching dashboard stats...");

      const [taskStats, guestStats, rsvpStats] = await Promise.all([
        TaskService.getTaskStats(),
        GuestService.getGuestStats(),
        GuestService.getRSVPStats(),
      ]);

      console.log("Task stats:", taskStats);
      console.log("Guest stats:", guestStats);
      console.log("RSVP stats:", rsvpStats);

      setStats({
        totalGuests: guestStats.totalGuests || 0,
        totalRSVPs: rsvpStats.totalResponded || 0,
        totalTasks: taskStats.totalTasks || 0,
        pendingTasks: taskStats.pendingTasks || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Calculate time until the wedding
  const calculateTimeLeft = () => {
    const weddingDate = new Date("2026-10-07T00:00:00"); // October 7th, 2026
    const now = new Date();
    const difference = weddingDate - now;

    if (difference > 0) {
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    }
  };

  useEffect(() => {
    fetchStats();
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="dashboard">
      <h1>Wedding Dashboard</h1>
      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Guests</h3>
          <p>{stats.totalGuests}</p>
          <small>RSVPs: {stats.totalRSVPs}</small>
        </div>
        <div className="stat-card">
          <h3>Tasks</h3>
          <p>{stats.pendingTasks}</p>
          <small>Pending out of {stats.totalTasks} total</small>
        </div>
        <div className="stat-card">
          <h3>Progress</h3>
          <p>
            {Math.round(
              ((stats.totalTasks - stats.pendingTasks) / stats.totalTasks) *
                100 || 0
            )}
            %
          </p>
          <small>Tasks Completed</small>
        </div>
      </div>
      <div className="countdown-container">
        <h2>Time Until The Big Day</h2>
        <div className="countdown">
          <div className="countdown-item">
            <span>{timeLeft.days}</span>
            <p>Days</p>
          </div>
          <div className="countdown-item">
            <span>{timeLeft.hours}</span>
            <p>Hours</p>
          </div>
          <div className="countdown-item">
            <span>{timeLeft.minutes}</span>
            <p>Minutes</p>
          </div>
          <div className="countdown-item">
            <span>{timeLeft.seconds}</span>
            <p>Seconds</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
