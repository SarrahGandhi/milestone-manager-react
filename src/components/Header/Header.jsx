import React, { useState, useEffect } from "react";
import LoginModal from "../Auth/LoginModal";
import AuthService from "../../services/authService";
import "./Header.css"; // We'll add styles here

const Header = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Check if user is logged in on component mount
  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (currentUser) {
      setUser(currentUser);
    }
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

  return (
    <>
      <header className="header">
        <div className="logo">MILESTONE MANAGER</div>
        <nav className="nav">
          <a href="/">HOME</a>
          <div className="dropdown">
            <a href="/planning">WEDDING PLANNING</a>
            <div className="dropdown-content">
              <a href="/events">Event Manager</a>
              <a href="/guests">Guest List</a>
              <a href="/rsvp-manager">RSVP Manager</a>
              <a href="/budget">Budget</a>
              <a href="/planning/vendors">Vendors</a>
              <a href="/taskmanager">Task Manager</a>
              <a href="/planning/checklist">Task Checklist</a>
              <a href="/planning/inspiration">Inspiration</a>
            </div>
          </div>
          <a href="/website">WEDDING WEBSITE</a>
          <a href="/about">ABOUT</a>

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
