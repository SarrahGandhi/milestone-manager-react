import React, { useState, useEffect } from "react";
import BudgetService from "../../../services/budgetService";
import "./BudgetForms.css";

const EditBudgetForm = ({ budgetItem, onClose, events, categories }) => {
  const [formData, setFormData] = useState({
    description: "",
    category: "",
    eventId: "",
    estimatedCost: "",
    actualCost: "",
    notes: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (budgetItem) {
      console.log("Budget item in edit form:", budgetItem);
      setFormData({
        description: budgetItem.description || "",
        category: budgetItem.category || "",
        eventId: budgetItem.eventId?._id || budgetItem.eventId || "",
        estimatedCost: budgetItem.estimatedCost || "",
        actualCost: budgetItem.actualCost || "",
        notes: budgetItem.notes || "",
      });
    }
  }, [budgetItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await BudgetService.updateBudgetItem(budgetItem._id, formData);
      onClose();
    } catch (error) {
      console.error("Error updating budget item:", error);
      setError(error.message || "Failed to update budget item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Budget Item</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="eventId">Event</label>
            <select
              id="eventId"
              name="eventId"
              value={formData.eventId}
              onChange={handleChange}
              required
            >
              <option value="">Select an event</option>
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="estimatedCost">Estimated Cost ($)</label>
            <input
              type="number"
              id="estimatedCost"
              name="estimatedCost"
              value={formData.estimatedCost}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="actualCost">Actual Cost ($)</label>
            <input
              type="number"
              id="actualCost"
              name="actualCost"
              value={formData.actualCost}
              onChange={handleChange}
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Updating..." : "Update Budget Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBudgetForm;
