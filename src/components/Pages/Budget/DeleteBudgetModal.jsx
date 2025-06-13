import React from "react";
import "./BudgetForms.css";

const DeleteBudgetModal = ({ isOpen, itemDescription, onConfirm, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content delete-modal">
        <h2>Delete Budget Item</h2>
        <p>
          Are you sure you want to delete the budget item "{itemDescription}"?
          This action cannot be undone.
        </p>
        <div className="form-actions">
          <button type="button" onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="delete-btn">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteBudgetModal;
