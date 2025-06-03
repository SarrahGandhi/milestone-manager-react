import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../Header/Header";
import Footer from "../../Footer/Footer";
import "./AddEventForm.css";

const AddEventForm = () => {
  const [formData, setFormData] = useState({
    eventName: "",
    date: "",
    time: "",
    location: "",
    dressCode: "",
    additionalDetails: "",
  });

  const [menuOptions, setMenuOptions] = useState(["", ""]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

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
        eventDate: formData.date,
        startTime: formData.time,
        location: formData.location,
        dressCode: formData.dressCode,
        menu: menuOptions.filter((option) => option.trim() !== ""),
        additionalDetails: formData.additionalDetails,
        organizer: "Current User", // You might want to get this from user context
        description: formData.additionalDetails || "Event created via form",
      };

      const response = await fetch("http://localhost:5001/api/Events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        setMessage("Event created successfully!");
        setTimeout(() => {
          navigate("/events");
        }, 2000);
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.message}`);
      }
    } catch (error) {
      setMessage("Error creating event. Please try again.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="add-event-container">
        <div className="add-event-form">
          <h1>Add New Event</h1>

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
                        onChange={(e) =>
                          handleMenuChange(index, e.target.value)
                        }
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
                {loading ? "Creating Event..." : "Create Event"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AddEventForm;
