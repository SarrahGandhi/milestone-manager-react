import React from "react";
import "./Header.css"; // We'll add styles here

const Header = () => (
  <header className="header">
    <div className="logo">LOGO</div>
    <nav className="nav">
      <a href="/">HOME</a>
      <a href="/planning">WEDDING PLANNING</a>
      <a href="/website">WEDDING WEBSITE</a>
      <a href="/about">ABOUT</a>
      <button className="login-btn">LOGIN</button>
    </nav>
  </header>
);

export default Header;
