import React from "react";
import "./About.css";

const About = () => {
  return (
    <div className="about-container">
      {/* Hero Section */}
      <div className="about-hero">
        <div className="hero-content">
          <h1 className="main-title">Our Story</h1>
          <p className="hero-subtitle">
            Two paths that crossed and became one journey
          </p>
        </div>
      </div>

      {/* Main Story Section */}
      <div className="story-section">
        <div className="story-container">
          {/* Couple Image */}
          <div className="couple-image-section">
            <div className="image-frame">
              <div className="placeholder-image">
                <svg width="200" height="250" viewBox="0 0 200 250" fill="none">
                  <rect width="200" height="250" rx="8" fill="#f8f0f2" />
                  <circle cx="70" cy="80" r="20" fill="#e8b4bc" />
                  <circle cx="130" cy="80" r="20" fill="#e8b4bc" />
                  <path
                    d="M60 120C60 120 80 135 100 135C120 135 140 120 140 120"
                    stroke="#d4a5ae"
                    strokeWidth="2"
                    fill="none"
                  />
                  <text
                    x="100"
                    y="200"
                    textAnchor="middle"
                    fill="#8e6c88"
                    fontSize="12"
                    fontFamily="Montserrat"
                  >
                    Add Your Photo
                  </text>
                </svg>
              </div>
            </div>
          </div>

          {/* Story Content */}
          <div className="story-content">
            {/* How We Met */}
            <div className="story-chapter">
              <div className="chapter-header">
                <h2>How We Met</h2>
              </div>
              <div className="story-text">
                <p>
                  We first met at the university library during finals week.
                  Sarah was studying for her literature exam when Alex asked to
                  share her table. What started as a simple request for space
                  turned into hours of conversation about books, travel, and our
                  shared love of coffee.
                </p>
                <p>
                  That evening marked the beginning of something special. We
                  discovered we had more in common than just academic stress -
                  we both dreamed of exploring the world and building something
                  meaningful together.
                </p>
              </div>
            </div>

            {/* First Date */}
            <div className="story-chapter">
              <div className="chapter-header">
                <h2>Our First Date</h2>
              </div>
              <div className="story-text">
                <p>
                  Three days later, Alex suggested dinner at a local Italian
                  restaurant. The conversation flowed as easily as it had in the
                  library, covering everything from childhood memories to future
                  aspirations. We talked until the restaurant was ready to
                  close.
                </p>
                <p>
                  Walking back through the city that night, we both knew this
                  was the start of something important. The connection felt
                  natural and genuine - exactly what we'd both been hoping to
                  find.
                </p>
              </div>
            </div>

            {/* The Proposal */}
            <div className="story-chapter">
              <div className="chapter-header">
                <h2>The Proposal</h2>
              </div>
              <div className="story-text">
                <p>
                  Two years later, Alex planned a surprise proposal at the same
                  library where we first met. He had arranged with the staff to
                  reserve our original table, complete with the same literature
                  books Sarah had been studying that first day.
                </p>
                <p>
                  When Sarah arrived for what she thought was a regular study
                  session, she found Alex waiting with a ring and a simple
                  question that would change everything. The answer was an easy
                  yes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quote Section */}
      <div className="quote-section">
        <div className="quote-container">
          <p className="quote-text">
            "The best love stories aren't those that end happily ever after, but
            those that begin with 'and then we built a life together.'"
          </p>
          <div className="quote-attribution">Sarah & Alex</div>
        </div>
      </div>

      {/* Wedding Details */}
      <div className="wedding-details">
        <div className="details-container">
          <h2>Wedding Details</h2>
          <div className="wedding-info">
            <div className="info-item">
              <div className="info-text">
                <h3>Date</h3>
                <p>June 15th, 2024</p>
              </div>
            </div>
            <div className="info-item">
              <div className="info-text">
                <h3>Venue</h3>
                <p>
                  The Grand Ballroom
                  <br />
                  Royal Gardens Estate
                </p>
              </div>
            </div>
            <div className="info-item">
              <div className="info-text">
                <h3>Schedule</h3>
                <p>
                  4:00 PM Ceremony
                  <br />
                  6:00 PM Reception
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
