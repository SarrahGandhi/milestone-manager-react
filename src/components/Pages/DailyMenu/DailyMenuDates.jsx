import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./DailyMenu.css";
import "../Events/Events.css";
import {
  listDailyMenuDates,
  getDailyMenusByDate,
} from "../../../services/dailyMenuService";

function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function DailyMenuDates() {
  const navigate = useNavigate();
  const [viewDate, setViewDate] = useState(null);

  const { monthLabel, days } = useMemo(() => {
    if (!viewDate) return { monthLabel: "", days: [] };
    const year = viewDate.getFullYear();
    const monthIndex = viewDate.getMonth();
    const monthLabel = viewDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
    });

    const start = new Date(year, monthIndex, 1);
    const end = new Date(year, monthIndex + 1, 0);
    const dayCount = end.getDate();

    const days = Array.from({ length: dayCount }, (_, i) => {
      const d = new Date(year, monthIndex, i + 1);
      return {
        date: d,
        iso: toIsoDate(d),
        label: String(i + 1),
      };
    });

    return { monthLabel, days };
  }, [viewDate]);

  const [datesWithMenus, setDatesWithMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dateSummaries, setDateSummaries] = useState({});
  const [newDate, setNewDate] = useState("");
  const dateInputRef = useRef(null);

  const refreshDates = async () => {
    setLoading(true);
    setError("");
    try {
      const year = viewDate.getFullYear();
      const monthIndex = viewDate.getMonth();
      const start = toIsoDate(new Date(year, monthIndex, 1));
      const end = toIsoDate(new Date(year, monthIndex + 1, 0));
      const result = await listDailyMenuDates(start, end);
      const dates = result || [];
      setDatesWithMenus(dates);

      // Build per-date meal presence summaries to show labels like Breakfast/Lunch/Dinner
      const entries = await Promise.all(
        dates.map(async (iso) => {
          try {
            const menus = await getDailyMenusByDate(iso);
            const hasMeal = (val) => {
              if (!val) return false;
              if (typeof val === "string") return val.trim().length > 0;
              const items = Array.isArray(val.items)
                ? val.items.filter((s) => s && s.trim() !== "")
                : [];
              const full = (val.full || "").trim();
              return items.length > 0 || !!full;
            };
            const summary = {
              breakfast: menus.some((m) => hasMeal(m.breakfast)),
              lunch: menus.some((m) => hasMeal(m.lunch)),
              snack: menus.some((m) => hasMeal(m.snack)),
              dinner: menus.some((m) => hasMeal(m.dinner)),
            };
            return [iso, summary];
          } catch (_) {
            return [
              iso,
              { breakfast: false, lunch: false, snack: false, dinner: false },
            ];
          }
        })
      );
      const map = Object.fromEntries(entries);
      setDateSummaries(map);
    } catch (e) {
      setError(e.message || "Failed to load dates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewDate) {
      refreshDates();
    }
  }, [viewDate]);

  // Initialize month from available menu dates (not today's month)
  useEffect(() => {
    (async () => {
      try {
        const allDates = await listDailyMenuDates();
        if (Array.isArray(allDates) && allDates.length > 0) {
          // Use month of the first date that has menus
          const [y, m] = allDates[0].split("-");
          const initial = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
          setViewDate(initial);
        }
      } catch (_) {}
    })();
  }, []);

  const goPrevMonth = () => {
    const d = new Date(viewDate);
    d.setMonth(viewDate.getMonth() - 1);
    setViewDate(d);
  };

  const goNextMonth = () => {
    const d = new Date(viewDate);
    d.setMonth(viewDate.getMonth() + 1);
    setViewDate(d);
  };

  const formatDateUpper = (iso) => {
    const [year, month, day] = iso.split("-").map((s) => parseInt(s, 10));
    const date = new Date(year, month - 1, day);
    const nth = (n) => {
      const s = ["th", "st", "nd", "rd"]; // 0th index used for 11-13
      const v = n % 100;
      return s[(v - 20) % 10] || s[v] || s[0];
    };
    const label = `${day}${nth(day)} ${date.toLocaleString(undefined, {
      month: "long",
    })}, ${year}`;
    return label.toUpperCase();
  };

  return (
    <div className="events-root">
      <div className="events-header-row">
        <button
          type="button"
          className="add-task-btn"
          onClick={() => {
            if (!newDate) {
              if (dateInputRef.current && dateInputRef.current.showPicker) {
                try {
                  dateInputRef.current.showPicker();
                } catch (_) {
                  dateInputRef.current.focus();
                }
              } else if (dateInputRef.current) {
                dateInputRef.current.focus();
              }
              return;
            }

            // Check if a menu already exists for this date
            if (datesWithMenus.includes(newDate)) {
              alert(
                `A menu already exists for ${newDate}. Click on the date to edit the existing menu.`
              );
              return;
            }

            navigate(`/daily-menu/date/${newDate}`);
          }}
        >
          Add Menu
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            className="icon-btn"
            onClick={goPrevMonth}
            aria-label="Previous Month"
          >
            ‹
          </button>
          <h3 style={{ margin: 0 }}>{monthLabel}</h3>
          <button
            className="icon-btn"
            onClick={goNextMonth}
            aria-label="Next Month"
          >
            ›
          </button>
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            ref={dateInputRef}
            style={{ marginLeft: 12 }}
          />
        </div>
      </div>

      {!viewDate ? (
        <div className="loading-message">Loading menus...</div>
      ) : loading ? (
        <div className="loading-message">Loading menus...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : datesWithMenus.length === 0 ? (
        <div className="no-events-message">No menus this month.</div>
      ) : (
        <div className="events-card-row">
          {datesWithMenus.map((iso) => (
            <div
              key={iso}
              className="event-card"
              onClick={() => navigate(`/daily-menu/date/${iso}`)}
              style={{ cursor: "pointer" }}
            >
              <h2 className="event-title">{formatDateUpper(iso)}</h2>
              {dateSummaries[iso]?.breakfast && (
                <div className="event-info">BREAKFAST</div>
              )}
              {dateSummaries[iso]?.lunch && (
                <div className="event-info">LUNCH</div>
              )}
              {dateSummaries[iso]?.dinner && (
                <div className="event-info">DINNER</div>
              )}
              {dateSummaries[iso]?.snack && (
                <div className="event-info">SNACK</div>
              )}
              <div className="event-btn-row">
                <button
                  className="event-view-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/daily-menu/date/${iso}`);
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
