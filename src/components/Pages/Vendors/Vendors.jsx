import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../Footer/Footer";
import vendorService from "../../../services/vendorService";
import "./Vendors.css";

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
      const data = await vendorService.list();
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

  // Client-side filtering
  const normalizedQuery = (searchQuery || "").trim().toLowerCase();
  const filtered = normalizedQuery
    ? vendors.filter((v) =>
        [v.name, v.category, v.contactName, v.email, v.phone]
          .filter((f) => f !== undefined && f !== null)
          .some((field) =>
            String(field).toLowerCase().includes(normalizedQuery)
          )
      )
    : vendors;

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
        const updated = await vendorService.update(editing.id, payload);
        setVendors((prev) => {
          const others = prev.filter((x) => x.id !== updated.id);
          return [updated, ...others];
        });
      } else {
        const created = await vendorService.create(payload);
        setVendors((prev) => {
          const others = prev.filter((x) => x.id !== created.id);
          return [created, ...others];
        });
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
      // Clear search so the newly created vendor is visible immediately
      setSearchQuery("");
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
    return <div className="loading-message">Loading vendors...</div>;
  }
  if (error) {
    return (
      <div className="error-message">
        <div>{error}</div>
        <button className="retry-btn" onClick={load}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="vendors-root">
        <div className="vendors-header-row">
          <button
            className="add-task-btn"
            onClick={() => setShowForm((s) => !s)}
          >
            {showForm ? "Close" : "Add Vendor"}
          </button>
          <div className="vendors-search-wrap">
            <input
              type="text"
              className="vendors-search-bar"
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {showForm && (
          <div className="vendor-form-card">
            <form onSubmit={onSubmit} className="vendor-form">
              <div className="form-grid">
                <input
                  className="vendor-input"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  placeholder="Vendor name"
                  required
                />
                <select
                  className="vendor-select"
                  name="category"
                  value={form.category}
                  onChange={onChange}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <input
                  className="vendor-input"
                  name="contactName"
                  value={form.contactName}
                  onChange={onChange}
                  placeholder="Contact name"
                />
                <input
                  className="vendor-input"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="Email"
                />
                <input
                  className="vendor-input"
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  placeholder="Phone"
                />
                <input
                  className="vendor-input"
                  name="website"
                  value={form.website}
                  onChange={onChange}
                  placeholder="Website"
                />
                <input
                  className="vendor-input"
                  name="address"
                  value={form.address}
                  onChange={onChange}
                  placeholder="Address"
                />
                <select
                  className="vendor-select"
                  name="status"
                  value={form.status}
                  onChange={onChange}
                >
                  <option value="prospect">Prospect</option>
                  <option value="contacted">Contacted</option>
                  <option value="booked">Booked</option>
                  <option value="declined">Declined</option>
                </select>
                <input
                  className="vendor-input"
                  name="costEstimate"
                  value={form.costEstimate}
                  onChange={onChange}
                  placeholder="Cost estimate (e.g. 1500)"
                  type="number"
                  min="0"
                  step="0.01"
                />
                <textarea
                  className="vendor-textarea"
                  name="notes"
                  value={form.notes}
                  onChange={onChange}
                  placeholder="Notes"
                  rows={3}
                />
              </div>
              <div className="form-actions">
                <button
                  className="vendor-save-btn"
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editing
                    ? "Update Vendor"
                    : "Save Vendor"}
                </button>
                <button
                  type="button"
                  className="vendor-cancel-btn"
                  onClick={() => {
                    setShowForm(false);
                    setEditing(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="no-vendors-message">
            {normalizedQuery
              ? "No vendors match your search."
              : "No vendors yet. Click 'Add Vendor' to get started."}
          </div>
        ) : (
          <div className="vendors-card-row">
            {filtered.map((v) => (
              <div key={v.id} className="vendor-card">
                <div className="vendor-card-header">
                  <div>
                    <div className="vendor-title">{v.name}</div>
                    <div className="vendor-badges">
                      {v.category && (
                        <span className="vendor-badge vendor-category-badge">
                          {v.category}
                        </span>
                      )}
                      {v.status && (
                        <span
                          className={`vendor-badge vendor-status-badge status-${v.status}`}
                        >
                          {v.status}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="vendor-actions">
                    <button
                      className="vendor-edit-btn"
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
                    <button
                      className="vendor-delete-btn"
                      onClick={() => onDelete(v.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="vendor-details">
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
