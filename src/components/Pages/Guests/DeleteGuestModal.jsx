import React from "react";
import "./DeleteGuestModal.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

const DeleteGuestModal = ({ isOpen, guestName, onConfirm, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="delete-guest-modal">
        <div className="modal-header">
          <div className="warning-icon">
            <FontAwesomeIcon icon={faExclamationTriangle} />
          </div>
          <button className="close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="modal-content">
          <h2>Delete Guest</h2>
          <p>
            Are you sure you want to delete <strong>"{guestName}"</strong>?
          </p>
          <p className="warning-text">
            This action cannot be undone. The guest and all associated RSVP data
            will be permanently removed.
          </p>
        </div>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="delete-btn" onClick={onConfirm}>
            Delete Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteGuestModal;
