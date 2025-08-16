import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
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
import AddEventForm from "./components/Pages/Events/AddEventForm";
import EditEventForm from "./components/Pages/Events/EditEventForm";
import Budget from "./components/Pages/Budget/Budget";
import Admins from "./components/Pages/Admins/Admins";

import WeddingWebsite from "./components/Pages/WeddingWebsite/WeddingWebsite";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AdminRoute from "./components/Auth/AdminRoute";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
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

  if (!isAuthenticated) {
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
        <p>Please log in to access this feature.</p>
        <div style={{ marginTop: "1rem" }}>
          <button
            onClick={() => (window.location.href = "/admin")}
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
        </div>
      </div>
    );
  }

  return children;
};

// Component to conditionally render Header
const ConditionalHeader = () => {
  const location = useLocation();

  // Hide header on wedding website page
  if (location.pathname === "/") {
    return null;
  }

  return <Header />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ConditionalHeader />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <WeddingWebsite />
                <Footer />
              </>
            }
          />
          <Route
            path="/admin"
            element={
              <>
                <Home />
                <Footer />
              </>
            }
          />
          <Route
            path="/admins"
            element={
              <AdminRoute>
                <Admins />
                <Footer />
              </AdminRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <Events />
                <Footer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/add"
            element={
              <AdminRoute>
                <AddEventForm />
              </AdminRoute>
            }
          />
          <Route
            path="/events/edit/:eventId"
            element={
              <AdminRoute>
                <EditEventForm />
              </AdminRoute>
            }
          />
          <Route
            path="/events/:eventId"
            element={
              <ProtectedRoute>
                <EventDetails />
                <Footer />
              </ProtectedRoute>
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
          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
