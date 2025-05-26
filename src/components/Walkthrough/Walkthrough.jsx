import React from "react";
import "./Walkthrough.css";

const Walkthrough = () => (
  <>
    <div className="role-section">
      <div className="role-row">
        <div className="role-image-placeholder"></div>
        <div className="role-info">
          <h2>For Admins</h2>
          <div className="role-desc">Create Events, Tasks, Users</div>
          <div className="role-link">See How it works</div>
        </div>
      </div>
      <div className="role-row">
        <div className="role-image-placeholder"></div>
        <div className="role-info">
          <h2>For Planners</h2>
          <div className="role-desc">View Events, Tasks, Users</div>
          <div className="role-link">See How it works</div>
        </div>
      </div>
      <div className="role-row">
        <div className="role-image-placeholder"></div>
        <div className="role-info">
          <h2>For Guests</h2>
          <div className="role-desc">RSVP for events</div>
          <div className="role-link">See How it works</div>
        </div>
      </div>
    </div>
  </>
);

export default Walkthrough;
