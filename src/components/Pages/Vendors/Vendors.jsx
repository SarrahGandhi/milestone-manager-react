import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../Footer/Footer";
import vendorService from "../../../services/vendorService";
import AuthService from "../../../services/authService";

const CATEGORIES = [
  "Venue",
  "Catering",
  "Photography",
  "Videography",
  "Decor",
  "Florist",
  "Entertainment",
  "Music",
  "DJ",
  "Cake",
  "Bakery",
  "Beauty",
  "Planner",
  "Transportation",
  "Officiant",
  "Stationery",
  "Rentals",
  "Other",
];

const Vendors = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    category: "Other",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    notes: "",
    status: "prospect",
    costEstimate: "",
    eventId: "",
  });

  const navigate = useNavigate();

  const load = async () => {
    try {
      setLoading(true);
      const data = await vendorService.list({
        search: searchQuery || undefined,
      });
      setVendors(data);
      setError("");
    } catch (e) {
      setError(e.message || "Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []); // initial

  const filtered = vendors.filter((v) =>
    [v.name, v.category, v.contactName, v.email, v.phone]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...form,
        costEstimate: form.costEstimate ? Number(form.costEstimate) : null,
        eventId: form.eventId || null,
      };
      if (editing) {
        await vendorService.update(editing.id, payload);
      } else {
        await vendorService.create(payload);
      }
      setShowForm(false);
      setEditing(null);
      setForm({
        name: "",
        category: "Other",
        contactName: "",
        email: "",
        phone: "",
        website: "",
        address: "",
        notes: "",
        status: "prospect",
        costEstimate: "",
        eventId: "",
      });
      await load();
    } catch (e2) {
      alert(
        e2.message ||
          (editing ? "Failed to update vendor" : "Failed to add vendor")
      );
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this vendor?")) return;
    try {
      await vendorService.remove(id);
      await load();
    } catch (e) {
      alert(e.message || "Failed to delete vendor");
    }
  };

  if (loading) {
    return <div style={{ padding: "1rem" }}>Loading vendors...</div>;
  }
  if (error) {
    return (
      <div style={{ padding: "1rem" }}>
        {error} <button onClick={load}>Try again</button>
      </div>
    );
  }

  return (
    <>
      <div style={{ padding: "1rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <button
            className="add-task-btn"
            onClick={() => setShowForm((s) => !s)}
          >
            {showForm ? "Close" : "Add Vendor"}
          </button>
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            style={{ flex: 1, padding: "0.5rem" }}
          />
          <button onClick={load}>Search</button>
        </div>

        {showForm && (
          <form
            onSubmit={onSubmit}
            style={{ display: "grid", gap: "0.5rem", marginBottom: "1rem" }}
          >
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Vendor name"
              required
            />
            <select name="category" value={form.category} onChange={onChange}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              name="contactName"
              value={form.contactName}
              onChange={onChange}
              placeholder="Contact name"
            />
            <input
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="Email"
            />
            <input
              name="phone"
              value={form.phone}
              onChange={onChange}
              placeholder="Phone"
            />
            <input
              name="website"
              value={form.website}
              onChange={onChange}
              placeholder="Website"
            />
            <input
              name="address"
              value={form.address}
              onChange={onChange}
              placeholder="Address"
            />
            <select name="status" value={form.status} onChange={onChange}>
              <option value="prospect">Prospect</option>
              <option value="contacted">Contacted</option>
              <option value="booked">Booked</option>
              <option value="declined">Declined</option>
            </select>
            <input
              name="costEstimate"
              value={form.costEstimate}
              onChange={onChange}
              placeholder="Cost estimate (e.g. 1500)"
            />
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Vendor"}
            </button>
          </form>
        )}

        {filtered.length === 0 ? (
          <div>No vendors yet.</div>
        ) : (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {filtered.map((v) => (
              <div
                key={v.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  padding: "0.75rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{v.name}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      {v.category} {v.status ? `• ${v.status}` : ""}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => {
                        setEditing(v);
                        setForm({
                          name: v.name || "",
                          category: v.category || "Other",
                          contactName: v.contactName || "",
                          email: v.email || "",
                          phone: v.phone || "",
                          website: v.website || "",
                          address: v.address || "",
                          notes: v.notes || "",
                          status: v.status || "prospect",
                          costEstimate: v.costEstimate ?? "",
                          eventId: v.eventId || "",
                        });
                        setShowForm(true);
                      }}
                    >
                      Edit
                    </button>
                    <button onClick={() => onDelete(v.id)}>Delete</button>
                  </div>
                </div>
                <div
                  style={{
                    marginTop: "0.5rem",
                    display: "grid",
                    gap: "0.25rem",
                    fontSize: 14,
                  }}
                >
                  {v.contactName && <div>Contact: {v.contactName}</div>}
                  {v.email && <div>Email: {v.email}</div>}
                  {v.phone && <div>Phone: {v.phone}</div>}
                  {v.website && (
                    <div>
                      Website:{" "}
                      <a href={v.website} target="_blank" rel="noreferrer">
                        {v.website}
                      </a>
                    </div>
                  )}
                  {v.address && <div>Address: {v.address}</div>}
                  {v.costEstimate != null && (
                    <div>
                      Estimate: ${Number(v.costEstimate).toLocaleString()}
                    </div>
                  )}
                  {v.notes && <div>Notes: {v.notes}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Vendors;
