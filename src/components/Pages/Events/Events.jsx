import React from "react";
import Header from "../../Header/Header";
import Footer from "../../Footer/Footer";
import "./Events.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faCalendarAlt,
  faClock,
  faMapMarkerAlt,
  faPalette,
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

const Events = () => (
  <>
    <div className="events-root">
      <div className="events-header-row">
        <button className="add-task-btn">
          <FontAwesomeIcon icon={faPlus} />
          Add New Task
        </button>
        <input
          type="text"
          placeholder="Search events..."
          className="events-search-bar"
        />
      </div>
      <div className="events-card-row">
        {[0, 1, 2, 3].map((idx) => (
          <div key={idx} className="event-card">
            <h2 className="event-title">Bridal Shower</h2>
            <div className="event-info">
              <FontAwesomeIcon icon={faCalendarAlt} />
              7th October, 2026
            </div>
            <div className="event-info">
              <FontAwesomeIcon icon={faClock} />
              7:00 PM | Tuesday
            </div>
            <div className="event-info">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              Villa Vayu
            </div>
            <div className="event-info">
              <FontAwesomeIcon icon={faPalette} />
              Pink and Purple
            </div>
            <div className="event-details-link">View Details</div>
            <div className="event-card-btn-row">
              <button className="event-edit-btn">
                <FontAwesomeIcon icon={faEdit} /> Edit
              </button>
              <button className="event-delete-btn">
                <FontAwesomeIcon icon={faTrash} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </>
);

export default Events;
