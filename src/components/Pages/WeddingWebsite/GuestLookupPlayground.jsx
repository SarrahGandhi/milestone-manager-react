import React, { useState } from "react";
import GuestLookup from "./GuestLookup";

const sectionStyle = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "20px",
  marginBottom: "20px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
};

const GuestLookupPlayground = () => {
  // This page is intentionally simple: it lets us inspect the exact payload
  // coming back from GuestLookup before wiring it into the full RSVP flow.
  const [guestContext, setGuestContext] = useState(null);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8f5f1",
        padding: "32px 16px",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <div style={sectionStyle}>
          <h1 style={{ marginTop: 0 }}>Guest Lookup Playground</h1>
          <p style={{ marginBottom: "1rem", color: "#4b5563" }}>
            This page is for testing the new guest lookup flow. Search for one
            guest, then inspect the resolved family context and event grouping.
          </p>

          {guestContext && (
            <button
              type="button"
              onClick={() => setGuestContext(null)}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                background: "#fff",
                cursor: "pointer",
                marginBottom: "16px",
              }}
            >
              Clear Selection
            </button>
          )}

          {!guestContext && <GuestLookup onGuestFound={setGuestContext} />}
        </div>

        {guestContext && (
          <>
            <div style={sectionStyle}>
              <h2 style={{ marginTop: 0 }}>Selected Guest</h2>
              <p>
                <strong>Name:</strong> {guestContext.selectedGuest?.name}
              </p>
              <p>
                <strong>Category:</strong> {guestContext.selectedGuest?.category}
              </p>
              <p>
                <strong>Family ID:</strong>{" "}
                {guestContext.selectedGuest?.family_id ?? "No family"}
              </p>
              <p>
                <strong>Primary Email:</strong> {guestContext.email || "N/A"}
              </p>
            </div>

            <div style={sectionStyle}>
              <h2 style={{ marginTop: 0 }}>Family</h2>
              <p>
                <strong>Side:</strong> {guestContext.family?.side || "N/A"}
              </p>
              <p>
                <strong>Phone:</strong> {guestContext.family?.phone || "N/A"}
              </p>
              <p>
                <strong>Emails:</strong>{" "}
                {guestContext.family?.email?.length
                  ? guestContext.family.email.join(", ")
                  : "N/A"}
              </p>
            </div>

            <div style={sectionStyle}>
              <h2 style={{ marginTop: 0 }}>Family Members</h2>
              {guestContext.familyMembers?.length ? (
                <div style={{ display: "grid", gap: "12px" }}>
                  {guestContext.familyMembers.map((member) => (
                    <div
                      key={member.id}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: "10px",
                        padding: "14px",
                      }}
                    >
                      <p>
                        <strong>{member.name}</strong> ({member.category})
                      </p>
                      <p>
                        <strong>Invitations:</strong> {member.invitations.length}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No family members found.</p>
              )}
            </div>

            <div style={sectionStyle}>
              <h2 style={{ marginTop: 0 }}>Events With Invited Guests</h2>
              {guestContext.events?.length ? (
                <div style={{ display: "grid", gap: "16px" }}>
                  {guestContext.events.map((event) => (
                    <div
                      key={event.id}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: "10px",
                        padding: "16px",
                      }}
                    >
                      <h3 style={{ marginTop: 0 }}>{event.name}</h3>
                      <p>
                        <strong>Date:</strong> {event.date || "N/A"}
                      </p>
                      <p>
                        <strong>Location:</strong> {event.location || "N/A"}
                      </p>

                      <div style={{ marginTop: "12px" }}>
                        <strong>Invited Guests</strong>
                        <div style={{ display: "grid", gap: "10px", marginTop: "10px" }}>
                          {event.invitedGuests.map((invitedGuest) => (
                            <div
                              key={invitedGuest.rsvp_row_id}
                              style={{
                                background: "#f9fafb",
                                borderRadius: "8px",
                                padding: "12px",
                              }}
                            >
                              <div>{invitedGuest.guest_name}</div>
                              <div style={{ color: "#6b7280", marginTop: "4px" }}>
                                {invitedGuest.category} | RSVP:{" "}
                                {invitedGuest.rsvp_status}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No event invitations found for this selection.</p>
              )}
            </div>

            <div style={sectionStyle}>
              <h2 style={{ marginTop: 0 }}>Raw Payload</h2>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  background: "#111827",
                  color: "#f9fafb",
                  padding: "16px",
                  borderRadius: "10px",
                  overflowX: "auto",
                  marginBottom: 0,
                }}
              >
                {JSON.stringify(guestContext, null, 2)}
              </pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GuestLookupPlayground;
