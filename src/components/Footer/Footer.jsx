import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Footer = () => {
  return (
    <footer className="footer-root">
      <div className="footer-main">
        <div className="footer-section logo-section">
          <div className="footer-logo">Logo</div>
          <div className="footer-vision">
            Our vision is to provide convenience
            <br />
            and help increase your sales business.
          </div>
          <div className="footer-social-icons">
            <span className="footer-icon">
              <i className="fab fa-facebook-f"></i>
            </span>
            <span className="footer-icon">
              <i className="fab fa-twitter"></i>
            </span>
            <span className="footer-icon">
              <i className="fab fa-instagram"></i>
            </span>
          </div>
        </div>
        <div className="footer-section planning-section">
          <div className="footer-title">Planning Tools</div>
          <Link to="/taskmanager" className="footer-link">
            Task Manager
          </Link>
          <Link to="/budget" className="footer-link">
            Budget Tracker
          </Link>
          <Link to="/guests" className="footer-link">
            Guest Management
          </Link>
          <Link to="/events" className="footer-link">
            Event Details
          </Link>
        </div>
        <div className="footer-section features-section">
          <div className="footer-title">Features</div>
          <Link to="/rsvp-manager" className="footer-link">
            RSVP Manager
          </Link>
          <Link to="/" className="footer-link">
            Wedding Website
          </Link>
          <Link to="/admin" className="footer-link">
            Admin Dashboard
          </Link>
          <Link to="/admins" className="footer-link">
            Admin Management
          </Link>
        </div>
        <div className="footer-section support-section">
          <div className="footer-title">Support</div>
          <div className="footer-link">Help Center</div>
          <div className="footer-link">Contact Us</div>
          <div className="footer-link">Privacy Policy</div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-copyright">
          ©2025 Sarrah Gandhi. All rights reserved
        </div>
        <div className="footer-policy-links">
          <span className="footer-link">Privacy & Policy</span>
          <span className="footer-link">Terms & Condition</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
