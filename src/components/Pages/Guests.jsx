import React, { useState, useEffect } from "react";
import "./Guests.css";

const Guests = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [allFamilies, setAllFamilies] = useState([]);

  // Mock data - replace with actual API call
  useEffect(() => {
    // TODO: Replace with actual API call
    const mockEvents = [
      {
        id: 1,
        name: "Wedding Ceremony",
        families: [
          {
            id: 1,
            name: "Smith Family",
            men: 2,
            women: 2,
            kids: 1,
            rsvpStatus: "Pending",
            invitationStatus: "Sent",
          },
          {
            id: 2,
            name: "Johnson Family",
            men: 1,
            women: 1,
            kids: 0,
            rsvpStatus: "Confirmed",
            invitationStatus: "Sent",
          },
          {
            id: 3,
            name: "Williams Family",
            men: 3,
            women: 2,
            kids: 2,
            rsvpStatus: "Pending",
            invitationStatus: "Sent",
          },
        ],
      },
      {
        id: 2,
        name: "Reception",
        families: [
          {
            id: 1,
            name: "Smith Family",
            men: 2,
            women: 2,
            kids: 1,
            rsvpStatus: "Confirmed",
            invitationStatus: "Sent",
          },
          {
            id: 2,
            name: "Johnson Family",
            men: 1,
            women: 1,
            kids: 0,
            rsvpStatus: "Confirmed",
            invitationStatus: "Sent",
          },
        ],
      },
    ];
    setEvents(mockEvents);

    // Combine all unique families
    const uniqueFamilies = new Map();
    mockEvents.forEach((event) => {
      event.families.forEach((family) => {
        if (!uniqueFamilies.has(family.id)) {
          uniqueFamilies.set(family.id, {
            ...family,
            eventStatus: {},
          });
        }
        uniqueFamilies.get(family.id).eventStatus[event.id] = {
          rsvpStatus: family.rsvpStatus,
          invitationStatus: family.invitationStatus,
        };
      });
    });
    setAllFamilies(Array.from(uniqueFamilies.values()));
  }, []);

  const handleEdit = (familyId) => {
    // TODO: Implement edit functionality
    console.log("Edit family:", familyId);
  };

  const handleDelete = (familyId) => {
    // TODO: Implement delete functionality
    console.log("Delete family:", familyId);
  };

  const getEventStatus = (family, eventId) => {
    if (selectedEvent === "all") return null;
    return family.eventStatus[eventId]?.rsvpStatus || "Not Invited";
  };

  return (
    <div className="guests-container">
      <h1>Guest Management</h1>

      <div className="event-menu">
        <button
          className={`event-menu-item ${
            selectedEvent === "all" ? "active" : ""
          }`}
          onClick={() => setSelectedEvent("all")}
        >
          All Events
        </button>
        {events.map((event) => (
          <button
            key={event.id}
            className={`event-menu-item ${
              selectedEvent === event.id ? "active" : ""
            }`}
            onClick={() => setSelectedEvent(event.id)}
          >
            {event.name}
          </button>
        ))}
      </div>

      <div className="table-container">
        <table className="guests-table">
          <thead>
            <tr>
              <th>Family Name</th>
              <th>Men</th>
              <th>Women</th>
              <th>Kids</th>
              <th>Total</th>
              {selectedEvent !== "all" && <th>RSVP Status</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {allFamilies.map((family) => (
              <tr key={family.id}>
                <td>{family.name}</td>
                <td>{family.men}</td>
                <td>{family.women}</td>
                <td>{family.kids}</td>
                <td>{family.men + family.women + family.kids}</td>
                {selectedEvent !== "all" && (
                  <td>
                    <span
                      className={`status ${getEventStatus(
                        family,
                        selectedEvent
                      )?.toLowerCase()}`}
                    >
                      {getEventStatus(family, selectedEvent)}
                    </span>
                  </td>
                )}
                <td className="action-buttons">
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(family.id)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(family.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            <tr className="summary-row">
              <td>
                <strong>Total</strong>
              </td>
              <td>
                <strong>
                  {allFamilies.reduce((sum, family) => sum + family.men, 0)}
                </strong>
              </td>
              <td>
                <strong>
                  {allFamilies.reduce((sum, family) => sum + family.women, 0)}
                </strong>
              </td>
              <td>
                <strong>
                  {allFamilies.reduce((sum, family) => sum + family.kids, 0)}
                </strong>
              </td>
              <td>
                <strong>
                  {allFamilies.reduce(
                    (sum, family) =>
                      sum + family.men + family.women + family.kids,
                    0
                  )}
                </strong>
              </td>
              {selectedEvent !== "all" && <td></td>}
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Guests;
