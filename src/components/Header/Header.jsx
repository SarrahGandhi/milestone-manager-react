import React from "react";
import "./Header.css"; // We'll add styles here

const Header = () => (
  <header className="header">
    <div className="logo">LOGO</div>
    <nav className="nav">
      <a href="/">HOME</a>
      <div className="dropdown">
        <a href="/planning">WEDDING PLANNING</a>
        <div className="dropdown-content">
          <a href="/events">Event Manager</a>
          <a href="/guests">Guest List</a>
          <a href="/planning/budget">Budget</a>
          <a href="/planning/vendors">Vendors</a>
          <a href="/taskmanager">Task Manager</a>
          <a href="/planning/checklist">Task Checklist</a>
          <a href="/planning/inspiration">Inspiration</a>
        </div>
      </div>
      <a href="/website">WEDDING WEBSITE</a>
      <a href="/about">ABOUT</a>
      <button className="login-btn">LOGIN</button>
    </nav>
  </header>
);

export default Header;
