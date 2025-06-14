import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import LoginModal from "../Auth/LoginModal";
import AuthService from "../../services/authService";
import "./Header.css"; // We'll add styles here

const Header = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Check if user is logged in on component mount
  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

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
    setUser(userData);
  };

  const handleLogout = async () => {
    await AuthService.logout();
    setUser(null);
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
          {user && (
            <div className="dropdown" ref={dropdownRef}>
              <Link to="/planning" onClick={toggleDropdown}>
                WEDDING PLANNING {isDropdownOpen ? "▼" : "▶"}
              </Link>
              <div
                className={`dropdown-content ${isDropdownOpen ? "show" : ""}`}
              >
                <Link to="/events">Event Manager</Link>
                <Link to="/guests">Guest List</Link>
                <Link to="/rsvp-manager">RSVP Manager</Link>
                <Link to="/budget">Budget</Link>
                <Link to="/planning/vendors">Vendors</Link>
                <Link to="/taskmanager">Task Manager</Link>
                <Link to="/planning/checklist">Task Checklist</Link>
                <Link to="/inspiration">Inspiration</Link>
              </div>
            </div>
          )}

          {user ? (
            <div className="user-menu">
              <span className="user-greeting">Hi, {user.firstName}!</span>
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
