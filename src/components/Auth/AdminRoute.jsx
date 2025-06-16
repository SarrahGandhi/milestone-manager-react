import React from "react";
import { useAuth } from "../../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

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
        </div>
      </div>
    );
  }

  if (!isAdmin()) {
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
        <h2>Access Denied</h2>
        <p>
          You don't have permission to access this page. Admin privileges
          required.
        </p>
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
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
