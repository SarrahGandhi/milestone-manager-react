const express = require("express");
const router = express.Router();
const {
  createDailyMenu,
  upsertDailyMenuByDate,
  getDailyMenuById,
  getDailyMenusByDate,
  getDailyMenusByEvent,
  updateDailyMenu,
  deleteDailyMenu,
  listDailyMenuDates,
  getEventsWithMenus,
} = require("../controllers/dailyMenuController");
const { authenticateToken } = require("../middleware/auth");

// Create
router.post("/", authenticateToken, createDailyMenu);

// Upsert by date (optionally with eventId)
router.put("/date/:menuDate", authenticateToken, upsertDailyMenuByDate);

// Read (specific routes first, generic :id last)
router.get("/date/:menuDate/list", authenticateToken, getDailyMenusByDate);
router.get("/event/:eventId", authenticateToken, getDailyMenusByEvent);
// List unique dates that have menus (optionally in range)
router.get("/dates", authenticateToken, listDailyMenuDates);
// List events that have at least one attached daily menu
router.get("/events-with-menus", authenticateToken, getEventsWithMenus);
// Generic by id should be last to avoid shadowing above routes
router.get("/:id", authenticateToken, getDailyMenuById);

// Update
router.put("/:id", authenticateToken, updateDailyMenu);

// Delete
router.delete("/:id", authenticateToken, deleteDailyMenu);

module.exports = router;
