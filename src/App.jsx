import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Header from "./components/Header/Header";
import Home from "./components/Home/Home";
import Footer from "./components/Footer/Footer";
import Walkthrough from "./components/Walkthrough/Walkthrough";
import Events from "./components/Pages/Events/Events";
import EventDetails from "./components/Pages/Events/EventDetails";
import TaskManager from "./components/Pages/TaskManager";
import Guests from "./components/Pages/Guests";
import RSVPManager from "./components/Pages/RSVPManager";
import About from "./components/Pages/About/About";
import AddEventForm from "./components/Pages/Events/AddEventForm";
import EditEventForm from "./components/Pages/Events/EditEventForm";
import Budget from "./components/Pages/Budget/Budget";
import AuthService from "./services/authService";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await AuthService.validateToken();
        setIsAuthenticated(authenticated);
        if (!authenticated) {
          // Clear any invalid tokens
          AuthService.removeToken();
          setShowLogin(true);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        AuthService.removeToken();
        setIsAuthenticated(false);
        setShowLogin(true);
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "1.2rem",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!isAuthenticated && showLogin) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h2>Authentication Required</h2>
        <p>Please log in to access the Task Manager.</p>
        <div style={{ marginTop: "1rem" }}>
          <button
            onClick={() => (window.location.href = "/")}
            style={{
              padding: "0.5rem 1rem",
              marginRight: "1rem",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Go to Home
          </button>
          <button
            onClick={() => {
              // For now, just clear everything and go home
              // You can implement a proper login modal here
              AuthService.removeToken();
              window.location.href = "/";
            }}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Clear & Return
          </button>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Home />
              <Walkthrough />
              <Footer />
            </>
          }
        />
        <Route
          path="/events"
          element={
            <>
              <Events />
              <Footer />
            </>
          }
        />
        <Route path="/events/add" element={<AddEventForm />} />
        <Route path="/events/edit/:eventId" element={<EditEventForm />} />
        <Route
          path="/events/:eventId"
          element={
            <>
              <EventDetails />
              <Footer />
            </>
          }
        />
        <Route
          path="/taskmanager"
          element={
            <ProtectedRoute>
              <TaskManager />
            </ProtectedRoute>
          }
        />
        <Route path="/guests" element={<Guests />} />
        <Route
          path="/budget"
          element={
            <ProtectedRoute>
              <Budget />
              <Footer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rsvp-manager"
          element={
            <ProtectedRoute>
              <RSVPManager />
            </ProtectedRoute>
          }
        />
        <Route path="/about" element={<About />} />
        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
