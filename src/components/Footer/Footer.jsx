import React from "react";
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
        <div className="footer-section about-section">
          <div className="footer-title">About</div>
          <div className="footer-link">Our Story</div>
          <div className="footer-link">Video Walkthrough</div>
          <div className="footer-link">FAQ</div>
        </div>
        <div className="footer-section connect-section">
          <div className="footer-title">Connect</div>
          <div className="footer-link">Join the Planning Team</div>
          <div className="footer-link">Blog</div>
          <div className="footer-link">Podcast</div>
          <div className="footer-link">Invite a friend</div>
        </div>
        <div className="footer-section socials-section">
          <div className="footer-title">Socials</div>
          <div className="footer-link">Instagram</div>
          <div className="footer-link">Twitter</div>
          <div className="footer-link">Facebook</div>
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
