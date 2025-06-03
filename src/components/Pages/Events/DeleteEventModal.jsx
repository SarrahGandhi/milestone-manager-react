import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faTimes,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import "./DeleteEventModal.css";

const DeleteEventModal = ({
  isOpen,
  onClose,
  onConfirm,
  eventName,
  isDeleting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="delete-modal-overlay" onClick={onClose}>
      <div
        className="delete-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="delete-modal-header">
          <div className="delete-modal-icon">
            <FontAwesomeIcon icon={faExclamationTriangle} />
          </div>
          <button className="delete-modal-close" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="delete-modal-body">
          <h3>Delete Event</h3>
          <p>
            Are you sure you want to delete <strong>"{eventName}"</strong>?
          </p>
          <p className="delete-warning">This action cannot be undone.</p>
        </div>

        <div className="delete-modal-actions">
          <button
            className="delete-modal-cancel"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            className="delete-modal-confirm"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            <FontAwesomeIcon icon={faTrash} />
            {isDeleting ? "Deleting..." : "Delete Event"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteEventModal;
