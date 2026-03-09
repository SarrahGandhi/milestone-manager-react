import react from "react";
import { NavLink } from "react-router-dom";
import "./WeddingWebsite.css";
const WeddingWebsite = () => {
  return (
    <div className="wedding-website">
      <nav className="wedding-navbar">

        <div className="nav-logo">
          <img src="smlogo.png" alt="S&M" />

        </div>
        <ul className="nav-links">
          <li><NavLink to="/">Home</NavLink></li>
          <li><NavLink to="/our-story">Our Story</NavLink></li>
          <li><NavLink to="/invite">Find Your Invitation</NavLink></li>
        </ul>
      </nav>
      <div id="home" className="hero-section">
        <div className="hero-background"></div>
        <h1>Sarrah & Murtaza</h1>
        <p className="date">22.10.2026</p>
        <p className="tagline">Join us for our Special day</p>
      </div>
    </div >
  )
}
export default WeddingWebsite;