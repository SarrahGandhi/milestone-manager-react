import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getDailyMenusByDate,
  upsertDailyMenuByDate,
  deleteDailyMenu,
} from "../../../services/dailyMenuService";
import { getEvents } from "../../../services/eventService";
import "./DailyMenu.css";

export default function DailyMenuDetails() {
  const { isoDate } = useParams();
  const navigate = useNavigate();
  const [menus, setMenus] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [meals, setMeals] = useState({
    breakfast: { items: [""], full: "", eventId: "" },
    lunch: { items: [""], full: "", eventId: "" },
    snack: { items: [""], full: "", eventId: "" },
    dinner: { items: [""], full: "", eventId: "" },
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const evts = await getEvents();
        setEvents(evts);
      } catch (e) {}
    })();
  }, []);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const byDate = await getDailyMenusByDate(isoDate);
      setMenus(byDate);

      // If there's existing menu data, populate the form
      if (byDate && byDate.length > 0) {
        populateFormWithExistingData(byDate[0]);
      }
    } catch (e) {
      setError(e.message || "Failed to load menus");
    } finally {
      setLoading(false);
    }
  };

  const populateFormWithExistingData = (menuData) => {
    const parseMealData = (mealValue) => {
      if (!mealValue) {
        return { items: [""], full: "", eventId: "" };
      }

      if (typeof mealValue === "string") {
        return { items: [""], full: mealValue, eventId: "" };
      }

      return {
        items:
          Array.isArray(mealValue.items) && mealValue.items.length > 0
            ? mealValue.items
            : [""],
        full: mealValue.full || "",
        eventId: mealValue.eventId || "",
      };
    };

    setMeals({
      breakfast: parseMealData(menuData.breakfast),
      lunch: parseMealData(menuData.lunch),
      snack: parseMealData(menuData.snack),
      dinner: parseMealData(menuData.dinner),
    });
    setHasUnsavedChanges(false);

    // Scroll to form when editing
    setTimeout(() => {
      const formElement = document.querySelector(".daily-menu-form");
      if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  useEffect(() => {
    load();
  }, [isoDate]);

  // No day-level form fields anymore

  const handleMealItemChange = (mealKey, idx, value) => {
    setMeals((prev) => {
      const updated = { ...prev };
      const items = [...updated[mealKey].items];
      items[idx] = value;
      updated[mealKey] = { ...updated[mealKey], items };
      return updated;
    });
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
  };

  const handleMealFullChange = (mealKey, value) => {
    setMeals((prev) => ({
      ...prev,
      [mealKey]: { ...prev[mealKey], full: value },
    }));
    setHasUnsavedChanges(true);
  };

  const handleMealEventChange = (mealKey, value) => {
    setMeals((prev) => ({
      ...prev,
      [mealKey]: { ...prev[mealKey], eventId: value },
    }));
    setHasUnsavedChanges(true);
  };

  const normalizeMealPayload = (meal) => {
    const items = (meal.items || [])
      .map((s) => (s || "").trim())
      .filter((s) => s !== "");
    const full = (meal.full || "").trim();
    const eventId = (meal.eventId || "").trim();
    if (items.length === 0 && !full && !eventId) return null;
    const payload = { items, full };
    if (eventId) payload.eventId = eventId;
    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        menuDate: isoDate,
        // No day-level event or notes; per-meal attachments only
        breakfast: normalizeMealPayload(meals.breakfast),
        lunch: normalizeMealPayload(meals.lunch),
        snack: normalizeMealPayload(meals.snack),
        dinner: normalizeMealPayload(meals.dinner),
      };
      const savedMenu = await upsertDailyMenuByDate(isoDate, payload);
      await load();
      setHasUnsavedChanges(false);

      // Keep the form populated with the saved data for easy editing
      // The load() function will populate the form automatically
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
      await load();
      // Clear form after deletion
      clearForm();
    } catch (e) {
      setError(e.message || "Failed to delete menu");
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setMeals({
      breakfast: { items: [""], full: "", eventId: "" },
      lunch: { items: [""], full: "", eventId: "" },
      snack: { items: [""], full: "", eventId: "" },
      dinner: { items: [""], full: "", eventId: "" },
    });
    setHasUnsavedChanges(false);
  };

  return (
    <div className="daily-menu-root">
      <div className="daily-menu-header">
        <h2>Menus for {isoDate}</h2>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/daily-menu/dates")}
        >
          ← Back to Dates
        </button>
      </div>

      <form onSubmit={handleSubmit} className="daily-menu-form">
        {["breakfast", "lunch", "snack", "dinner"].map((mealKey) => {
          const mealIcons = {
            breakfast: "🌅",
            lunch: "☀️",
            snack: "🍪",
            dinner: "🌙",
          };

          return (
            <div key={mealKey} className="card">
              <div className="card-header">
                <h3>
                  {mealIcons[mealKey]}{" "}
                  {mealKey.charAt(0).toUpperCase() + mealKey.slice(1)}
                </h3>
              </div>
              <div className="card-body meal-grid">
                <div className="meal-section">
                  <h4>🍽️ Menu Items</h4>
                  <div>
                    {meals[mealKey].items.map((item, idx) => (
                      <div key={idx} className="item-row">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) =>
                            handleMealItemChange(mealKey, idx, e.target.value)
                          }
                          placeholder={`Add ${mealKey} item...`}
                          className="item-input"
                        />
                        {meals[mealKey].items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMealItem(mealKey, idx)}
                            className="icon-btn"
                            title="Remove item"
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
                      ➕ Add Item
                    </button>
                  </div>
                </div>

                <div className="meal-section">
                  <h4>📝 Full Menu Description</h4>
                  <textarea
                    value={meals[mealKey].full}
                    onChange={(e) =>
                      handleMealFullChange(mealKey, e.target.value)
                    }
                    rows={3}
                    className="textarea"
                    placeholder={`Describe the complete ${mealKey} menu...`}
                  />
                </div>

                <div className="meal-section">
                  <h4>🎉 Attach to Event</h4>
                  <select
                    value={meals[mealKey].eventId}
                    onChange={(e) =>
                      handleMealEventChange(mealKey, e.target.value)
                    }
                    className="textarea"
                  >
                    <option value="">-- No Event --</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title} ({ev.eventDate})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          );
        })}
        <div className="form-actions-container">
          <div className="actions-row">
            <button
              type="button"
              onClick={clearForm}
              disabled={loading}
              className="btn btn-secondary"
            >
              🗑️ Clear Form
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`save-menu-btn ${
                hasUnsavedChanges ? "has-changes" : ""
              }`}
            >
              {loading ? (
                <>
                  <span>⏳</span>
                  Saving Menu...
                </>
              ) : (
                <>
                  <span>{hasUnsavedChanges ? "⚠️" : "💾"}</span>
                  {hasUnsavedChanges ? "Save Changes" : "Save Menu"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {error && <div className="error-message">{error}</div>}

      <div className="menus-list">
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
                      onClick={() => populateFormWithExistingData(m)}
                      disabled={loading}
                      className="btn btn-secondary"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      disabled={loading}
                      className="btn btn-danger"
                    >
                      🗑️ Delete
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
