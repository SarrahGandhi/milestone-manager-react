import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./WeddingWebsite.css"; // Reuse existing styles

const OurStory = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const handleNavigation = (sectionId) => {
        // If navigating to a section on the home page
        if (sectionId === "home") {
            navigate("/");
        } else if (sectionId === "timeline" || sectionId === "rsvp") {
            // Navigate to home and then scroll
            navigate("/", { state: { scrollTo: sectionId } });
            // Note: We'll need to handle the state in WeddingWebsite.jsx
        } else {
            setIsMenuOpen(false);
        }
    };

    return (
        <div className="wedding-website">
            {/* Navigation Bar */}
            <nav className={`wedding-navbar ${scrolled ? "scrolled" : ""}`}>
                <div className="nav-logo" onClick={() => handleNavigation("home")}>
                    S&M
                </div>
                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <i className={`fas ${isMenuOpen ? "fa-times" : "fa-bars"}`}></i>
                </button>
                <ul className={`nav-links ${isMenuOpen ? "open" : ""}`}>
                    <li>
                        <Link to="/" className="nav-link">
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link to="/our-story" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                            Our Story
                        </Link>
                    </li>
                    <li>
                        <a className="nav-link" onClick={() => handleNavigation("timeline")}>
                            Event Timeline
                        </a>
                    </li>
                    <li>
                        <a
                            className="nav-link"
                            onClick={() => handleNavigation("rsvp")}
                            style={{ color: "#9c8164", fontWeight: "bold" }}
                        >
                            Find Your Invitation
                        </a>
                    </li>
                </ul>
            </nav>

            {/* Hero-like header for Our Story */}
            <div className="hero-section" style={{ height: "50vh", minHeight: "400px" }}>
                <h1>Our Journey</h1>
                <p className="tagline">From the beginning to forever</p>
            </div>

            {/* Our Story Content */}
            <div className="our-story-section">
                <div className="story-content">
                    <p className="story-text">
                        Every love story is beautiful, but ours is our favorite. It all began
                        with a chance meeting that turned into a lifetime of memories. From
                        shared laughter to supporting each other's dreams, our journey has been
                        filled with love, growth, and endless adventures.
                    </p>
                    <p className="story-text">
                        We are so excited to start this next chapter of our lives together
                        and can't wait to celebrate our special day with all of our favorite
                        people!
                    </p>
                    <img
                        src="https://images.unsplash.com/photo-1511285560982-1351cdeb9821?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                        alt="Couple"
                        className="story-image"
                    />
                </div>
            </div>
        </div>
    );
};

export default OurStory;
