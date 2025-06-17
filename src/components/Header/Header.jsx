import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import LoginModal from "../Auth/LoginModal";
import { useAuth } from "../../context/AuthContext";
import "./Header.css"; // We'll add styles here

const Header = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Use the auth context instead of local state
  const { user, logout, isAuthenticated } = useAuth();

  // Add click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogin = (userData) => {
    // The AuthContext will handle the login state
    // We don't need to manage user state locally anymore
  };

  const handleLogout = async () => {
    await logout();
  };

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <>
      <header className="header">
        <div className="logo">MILESTONE MANAGER</div>
        <nav className="nav">
          <Link to="/">HOME</Link>
          <Link to="/wedding-website">WEDDING WEBSITE</Link>
          <Link to="/about">ABOUT</Link>
          {isAuthenticated && (
            <div className="dropdown" ref={dropdownRef}>
              <Link to="/planning" onClick={toggleDropdown}>
                WEDDING PLANNING {isDropdownOpen ? "▼" : "▶"}
              </Link>
              <div
                className={`dropdown-content ${isDropdownOpen ? "show" : ""}`}
              >
                <Link to="/events">Event Manager</Link>
                <Link to="/rsvp-manager">RSVP Manager</Link>
                <Link to="/budget">Budget</Link>
                <Link to="/planning/vendors">Vendors</Link>
                <Link to="/taskmanager">Task Manager</Link>
              </div>
            </div>
          )}

          {isAuthenticated ? (
            <div className="user-menu">
              <span className="user-greeting">
                Hi, {user?.firstName}!
                {user?.role === "admin" && (
                  <span className="admin-badge">Admin</span>
                )}
              </span>
              <button className="logout-btn" onClick={handleLogout}>
                LOGOUT
              </button>
            </div>
          ) : (
            <button className="login-btn" onClick={openLoginModal}>
              LOGIN
            </button>
          )}
        </nav>
      </header>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onLogin={handleLogin}
      />
    </>
  );
};

export default Header;
