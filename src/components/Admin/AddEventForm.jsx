import React, { useState } from "react";
import { getApiUrl } from "../../config";
import "./AddEventForm.css";

const AddEventForm = ({ onEventAdded }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    location: "",
    category: "other",
    priority: "medium",
    organizer: "",
    status: "draft",
    maxAttendees: "",
    registrationRequired: false,
    tags: "",
    notes: "",
  });

  const [attendees, setAttendees] = useState([
    { name: "", email: "", role: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAttendeeChange = (index, field, value) => {
    const updatedAttendees = [...attendees];
    updatedAttendees[index][field] = value;
    setAttendees(updatedAttendees);
  };

  const addAttendee = () => {
    setAttendees([...attendees, { name: "", email: "", role: "" }]);
  };

  const removeAttendee = (index) => {
    setAttendees(attendees.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Prepare form data
      const eventData = {
        ...formData,
        attendees: attendees.filter(
          (attendee) => attendee.name || attendee.email
        ),
        tags: formData.tags
          ? formData.tags.split(",").map((tag) => tag.trim())
          : [],
        maxAttendees: formData.maxAttendees
          ? parseInt(formData.maxAttendees)
          : null,
      };

      const response = await fetch(getApiUrl("/events"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        setMessage("Event created successfully!");
        setFormData({
          title: "",
          description: "",
          eventDate: "",
          startTime: "",
          endTime: "",
          location: "",
          category: "other",
          priority: "medium",
          organizer: "",
          status: "draft",
          maxAttendees: "",
          registrationRequired: false,
          tags: "",
          notes: "",
        });
        setAttendees([{ name: "", email: "", role: "" }]);

        if (onEventAdded) {
          onEventAdded();
        }
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
    <div className="add-event-form">
      <h2>Add New Event</h2>

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
        <div className="form-section">
          <h3>Basic Information</h3>

          <div className="form-group">
            <label htmlFor="title">Event Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="eventDate">Event Date *</label>
              <input
                type="date"
                id="eventDate"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="startTime">Start Time *</label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endTime">End Time *</label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="milestone">Milestone</option>
                <option value="meeting">Meeting</option>
                <option value="celebration">Celebration</option>
                <option value="deadline">Deadline</option>
                <option value="workshop">Workshop</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="organizer">Organizer *</label>
            <input
              type="text"
              id="organizer"
              name="organizer"
              value={formData.organizer}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Registration & Capacity</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="maxAttendees">Max Attendees</label>
              <input
                type="number"
                id="maxAttendees"
                name="maxAttendees"
                value={formData.maxAttendees}
                onChange={handleInputChange}
                min="1"
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="registrationRequired"
                  checked={formData.registrationRequired}
                  onChange={handleInputChange}
                />
                Registration Required
              </label>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Attendees</h3>
          {attendees.map((attendee, index) => (
            <div key={index} className="attendee-row">
              <input
                type="text"
                placeholder="Name"
                value={attendee.name}
                onChange={(e) =>
                  handleAttendeeChange(index, "name", e.target.value)
                }
              />
              <input
                type="email"
                placeholder="Email"
                value={attendee.email}
                onChange={(e) =>
                  handleAttendeeChange(index, "email", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Role"
                value={attendee.role}
                onChange={(e) =>
                  handleAttendeeChange(index, "role", e.target.value)
                }
              />
              {attendees.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAttendee(index)}
                  className="remove-btn"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addAttendee}
            className="add-attendee-btn"
          >
            Add Attendee
          </button>
        </div>

        <div className="form-section">
          <h3>Additional Information</h3>

          <div className="form-group">
            <label htmlFor="tags">Tags (comma-separated)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="e.g., important, quarterly, team-building"
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Creating Event..." : "Create Event"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEventForm;
