import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getEventById, updateEvent } from "../../../services/eventService";
import "./AddEventForm.css";

const EditEventForm = () => {
  const { eventId } = useParams();
  const [formData, setFormData] = useState({
    eventName: "",
    date: "",
    time: "",
    location: "",
    dressCode: "",
    additionalDetails: "",
    organizer: "",
  });

  const [menuOptions, setMenuOptions] = useState(["", ""]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Fetch existing event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setFetchLoading(true);
        const eventData = await getEventById(eventId);

          // Format date for input (YYYY-MM-DD format)
          // Keep the date string as-is if it's already in YYYY-MM-DD format
          const formattedDate = eventData.event_date || "";

          // Format time for input (HH:MM format)
          let formattedTime = "";
          if (eventData.start_time) {
            // If time includes AM/PM, convert to 24-hour format
            if (
              eventData.start_time.includes("AM") ||
              eventData.start_time.includes("PM")
            ) {
              const [time, period] = eventData.start_time.split(" ");
              const [hours, minutes] = time.split(":");
              let hour24 = parseInt(hours);

              if (period === "PM" && hour24 !== 12) {
                hour24 += 12;
              } else if (period === "AM" && hour24 === 12) {
                hour24 = 0;
              }

              formattedTime = `${hour24
                .toString()
                .padStart(2, "0")}:${minutes}`;
            } else {
              formattedTime = eventData.start_time;
            }
          }

          setFormData({
            eventName: eventData.title || "",
            date: formattedDate,
            time: formattedTime,
            location: eventData.location || "",
            dressCode: eventData.dress_code || "",
            additionalDetails:
              eventData.additional_details || eventData.description || "",
            organizer: eventData.organizer || "",
          });

          // Set menu options, ensuring at least two empty fields
          const menuItems = eventData.menu || [""];
          setMenuOptions(
            menuItems.length >= 2 ? menuItems : [...menuItems, ""]
          );
      } catch (error) {
        console.error("Error fetching event:", error);
        setMessage(error.message || "Error loading event data");
      } finally {
        setFetchLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMenuChange = (index, value) => {
    const updatedMenu = [...menuOptions];
    updatedMenu[index] = value;
    setMenuOptions(updatedMenu);
  };

  const addMenuOption = () => {
    setMenuOptions([...menuOptions, ""]);
  };

  const removeMenuOption = (index) => {
    if (menuOptions.length > 1) {
      setMenuOptions(menuOptions.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Prepare event data to match backend model
      const eventData = {
        title: formData.eventName,
        event_date: formData.date,
        start_time: formData.time,
        location: formData.location,
        dress_code: formData.dressCode,
        menu: menuOptions.filter((option) => option.trim() !== ""),
        additional_details: formData.additionalDetails,
        description: formData.additionalDetails || "Event updated via form",
        organizer: formData.organizer,
      };

      await updateEvent(eventId, eventData);
      setMessage("Event updated successfully!");
      setTimeout(() => {
        navigate("/events");
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      setMessage(`Error: ${error.message || "Error updating event. Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="add-event-container">
        <div className="loading-message">Loading event data...</div>
      </div>
    );
  }

  return (
    <div className="add-event-container">
      <div className="add-event-form">
        <h1>Edit Event</h1>

        {message && (
          <div
            className={`message ${
              message.includes("Error") ? "error" : "success"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Event Information Section */}
          <div className="form-section">
            <div className="section-header">
              <span className="section-icon">📅</span>
              <h2 className="section-title">Event Information</h2>
            </div>

            <div className="form-group">
              <label htmlFor="eventName">Event Name</label>
              <input
                type="text"
                id="eventName"
                name="eventName"
                value={formData.eventName}
                onChange={handleInputChange}
                placeholder="Enter a memorable event name..."
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Event Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="time">Start Time</label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Location & Dress Code Section */}
          <div className="form-section">
            <div className="section-header">
              <span className="section-icon">📍</span>
              <h2 className="section-title">Venue Details</h2>
            </div>

            <div className="form-group">
              <label htmlFor="location">Event Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Venue name or address..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="dressCode">Dress Code</label>
              <input
                type="text"
                id="dressCode"
                name="dressCode"
                value={formData.dressCode}
                onChange={handleInputChange}
                placeholder="e.g., Cocktail Attire, Formal, Casual"
              />
            </div>
          </div>

          {/* Menu Section */}
          <div className="form-section">
            <div className="section-header">
              <span className="section-icon">🍽️</span>
              <h2 className="section-title">Menu Options</h2>
            </div>

            <div className="form-group">
              <label>Menu Items</label>
              <div className="menu-options">
                {menuOptions.map((option, index) => (
                  <div key={index} className="menu-option">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleMenuChange(index, e.target.value)}
                      placeholder={`Menu option ${index + 1}...`}
                    />
                    {menuOptions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMenuOption(index)}
                        className="remove-option-btn"
                        title="Remove this option"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addMenuOption}
                  className="add-option-btn"
                >
                  Add Menu Option
                </button>
              </div>
            </div>
          </div>

          {/* Additional Details Section */}
          <div className="form-section">
            <div className="section-header">
              <span className="section-icon">📝</span>
              <h2 className="section-title">Additional Details</h2>
            </div>

            <div className="form-group">
              <label htmlFor="additionalDetails">Event Description</label>
              <textarea
                id="additionalDetails"
                name="additionalDetails"
                value={formData.additionalDetails}
                onChange={handleInputChange}
                rows="5"
                placeholder="Share more details about your event, special instructions, or any additional information your guests should know..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate("/events")}
              className="cancel-btn"
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? "Updating Event..." : "Update Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEventForm;
