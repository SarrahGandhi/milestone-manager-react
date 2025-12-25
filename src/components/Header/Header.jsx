import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import LoginModal from "../Auth/LoginModal";
import { useAuth } from "../../context/AuthContext";
import "./Header.css"; // We'll add styles here

const Header = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // New state for mobile menu
  const dropdownRef = useRef(null);

  // Use the auth context instead of local state
  const { user, logout, isAuthenticated, isAdmin } = useAuth();

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
    setIsMobileMenuOpen(false); // Close mobile menu on logout
  };

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsMobileMenuOpen(false); // Close mobile menu when opening login
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="header">
        <div className="logo">MILESTONE MANAGER</div>

        {/* Mobile Menu Toggle Button */}
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? "✕" : "☰"}
        </button>

        <nav className={`nav ${isMobileMenuOpen ? "nav-open" : ""}`}>
          <Link to="/" onClick={closeMobileMenu}>WEDDING WEBSITE</Link>
          <Link to="/admin" onClick={closeMobileMenu}>ADMIN</Link>
          {isAuthenticated && isAdmin() && (
            <Link to="/admins" onClick={closeMobileMenu}>USER MANAGEMENT</Link>
          )}
          {isAuthenticated && (
            <div className="dropdown" ref={dropdownRef}>
              <Link to="/planning" onClick={toggleDropdown}>
                WEDDING PLANNING {isDropdownOpen ? "▼" : "▶"}
              </Link>
              <div
                className={`dropdown-content ${isDropdownOpen ? "show" : ""}`}
              >
                <Link to="/events" onClick={closeMobileMenu}>Event Manager</Link>
                <Link to="/rsvp-manager" onClick={closeMobileMenu}>RSVP Manager</Link>
                <Link to="/budget" onClick={closeMobileMenu}>Budget</Link>
                <Link to="/daily-menu" onClick={closeMobileMenu}>Daily Menu</Link>
                <Link to="/taskmanager" onClick={closeMobileMenu}>Task Manager</Link>
                <Link to="/vendors" onClick={closeMobileMenu}>Vendor Manager</Link>
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
      </header>{" "}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onLogin={handleLogin}
      />
    </>
  );
};

export default Header;
