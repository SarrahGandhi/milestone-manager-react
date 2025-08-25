import React, { useEffect, useMemo, useState } from "react";
import {
  createDailyMenu,
  upsertDailyMenuByDate,
  getDailyMenusByDate,
  getDailyMenusByEvent,
  updateDailyMenu,
  deleteDailyMenu,
} from "../../../services/dailyMenuService";
import { getEvents } from "../../../services/eventService";
import "./DailyMenu.css";

const isoToday = () => new Date().toISOString().split("T")[0];

export default function DailyMenu() {
  const [menuDate, setMenuDate] = useState(isoToday());
  const [form, setForm] = useState({
    notes: "",
    eventId: "",
  });
  const [meals, setMeals] = useState({
    breakfast: { items: [""], full: "" },
    lunch: { items: [""], full: "" },
    snack: { items: [""], full: "" },
    dinner: { items: [""], full: "" },
  });
  const [menus, setMenus] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const evts = await getEvents();
        setEvents(evts);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const loadMenus = async () => {
    setLoading(true);
    setError("");
    try {
      const byDate = await getDailyMenusByDate(menuDate);
      setMenus(byDate);
    } catch (e) {
      setError(e.message || "Failed to load menus");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenus();
  }, [menuDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMealItemChange = (mealKey, index, value) => {
    setMeals((prev) => {
      const updated = { ...prev };
      const items = [...updated[mealKey].items];
      items[index] = value;
      updated[mealKey] = { ...updated[mealKey], items };
      return updated;
    });
  };

  const addMealItem = (mealKey) => {
    setMeals((prev) => {
      const updated = { ...prev };
      updated[mealKey] = {
        ...updated[mealKey],
        items: [...updated[mealKey].items, ""],
      };
      return updated;
    });
  };

  const removeMealItem = (mealKey, index) => {
    setMeals((prev) => {
      const updated = { ...prev };
      const items = updated[mealKey].items.filter((_, i) => i !== index);
      updated[mealKey] = {
        ...updated[mealKey],
        items: items.length ? items : [""],
      };
      return updated;
    });
  };

  const handleMealFullChange = (mealKey, value) => {
    setMeals((prev) => ({
      ...prev,
      [mealKey]: { ...prev[mealKey], full: value },
    }));
  };

  const normalizeMealPayload = (meal) => {
    const items = (meal.items || [])
      .map((s) => (s || "").trim())
      .filter((s) => s !== "");
    const full = (meal.full || "").trim();
    if (items.length === 0 && !full) return null;
    return { items, full };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        menuDate,
        eventId: form.eventId || null,
        notes: form.notes,
        breakfast: normalizeMealPayload(meals.breakfast),
        lunch: normalizeMealPayload(meals.lunch),
        snack: normalizeMealPayload(meals.snack),
        dinner: normalizeMealPayload(meals.dinner),
      };
      await upsertDailyMenuByDate(menuDate, payload);
      await loadMenus();
      setForm({ notes: "", eventId: "" });
      setMeals({
        breakfast: { items: [""], full: "" },
        lunch: { items: [""], full: "" },
        snack: { items: [""], full: "" },
        dinner: { items: [""], full: "" },
      });
    } catch (e) {
      setError(e.message || "Failed to save menu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this menu?")) return;
    setLoading(true);
    try {
      await deleteDailyMenu(id);
      await loadMenus();
    } catch (e) {
      setError(e.message || "Failed to delete menu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="daily-menu-root">
      <div className="daily-menu-header">
        <h2>Daily Menu</h2>
      </div>
      <div className="daily-menu-controls card">
        <div
          className="card-body"
          style={{ display: "flex", gap: 12, alignItems: "center" }}
        >
          <label>Date</label>
          <input
            type="date"
            value={menuDate}
            onChange={(e) => setMenuDate(e.target.value)}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="daily-menu-form">
        {["breakfast", "lunch", "snack", "dinner"].map((mealKey) => (
          <div key={mealKey} className="card">
            <div className="card-header">
              <h3>{mealKey.charAt(0).toUpperCase() + mealKey.slice(1)}</h3>
            </div>
            <div className="card-body meal-grid">
              <div>
                <h4 className="muted">Items</h4>
                <div>
                  {meals[mealKey].items.map((item, idx) => (
                    <div key={idx} className="item-row">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) =>
                          handleMealItemChange(mealKey, idx, e.target.value)
                        }
                        placeholder={`Item ${idx + 1}`}
                        className="item-input"
                      />
                      {meals[mealKey].items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMealItem(mealKey, idx)}
                          title="Remove item"
                          className="icon-btn"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addMealItem(mealKey)}
                    className="btn btn-secondary"
                  >
                    Add Item
                  </button>
                </div>
              </div>
              <div>
                <h4 className="muted">Full Menu (optional)</h4>
                <textarea
                  value={meals[mealKey].full}
                  onChange={(e) =>
                    handleMealFullChange(mealKey, e.target.value)
                  }
                  rows={2}
                  className="textarea"
                  placeholder="Enter full menu text for this meal"
                />
              </div>
            </div>
          </div>
        ))}
      </form>

      {error && <div className="error-message">{error}</div>}

      <div className="menus-list">
        <h3>Menus for {menuDate}</h3>
        {loading && menus.length === 0 ? (
          <div>Loading...</div>
        ) : menus.length === 0 ? (
          <div>No menus yet.</div>
        ) : (
          <ul
            style={{ listStyle: "none", padding: 0, display: "grid", gap: 12 }}
          >
            {menus.map((m) => (
              <li key={m.id} className="card">
                <div className="card-header menu-card-header">
                  <strong>
                    {m.eventId ? "Event Menu" : "General Menu"}
                    {m.eventId && (
                      <span style={{ marginLeft: 8, fontWeight: 400 }}>
                        (attached)
                      </span>
                    )}
                  </strong>
                  <div className="actions-row">
                    <button
                      onClick={() => handleDelete(m.id)}
                      disabled={loading}
                      className="btn btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  {renderMeal("Breakfast", m.breakfast)}
                  {renderMeal("Lunch", m.lunch)}
                  {renderMeal("Snack", m.snack)}
                  {renderMeal("Dinner", m.dinner)}
                  {m.notes && <div style={{ color: "#555" }}>{m.notes}</div>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function renderMeal(title, mealVal) {
  if (!mealVal) return null;
  if (typeof mealVal === "string") {
    return (
      <div>
        <b>{title}:</b> {mealVal}
      </div>
    );
  }
  const items = Array.isArray(mealVal.items)
    ? mealVal.items.filter((s) => s && s.trim() !== "")
    : [];
  const full = (mealVal.full || "").trim();
  if (items.length === 0 && !full) return null;
  return (
    <div>
      <b>{title}:</b>
      {items.length > 0 && (
        <ul style={{ margin: "6px 0 0 18px" }}>
          {items.map((it, idx) => (
            <li key={idx}>{it}</li>
          ))}
        </ul>
      )}
      {full && <div style={{ marginTop: items.length ? 6 : 0 }}>{full}</div>}
    </div>
  );
}
