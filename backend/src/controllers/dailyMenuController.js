const DailyMenu = require("../models/DailyMenu");

exports.createDailyMenu = async (req, res) => {
  try {
    const menu = await DailyMenu.create(req.body);
    res.status(201).json({ success: true, data: menu });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.upsertDailyMenuByDate = async (req, res) => {
  try {
    const { menuDate } = req.params;
    const menu = await DailyMenu.upsertByDate(menuDate, req.body);
    res.json({ success: true, data: menu });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getDailyMenuById = async (req, res) => {
  try {
    const menu = await DailyMenu.findById(req.params.id);
    if (!menu)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: menu });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDailyMenusByDate = async (req, res) => {
  try {
    const menus = await DailyMenu.findByDate(req.params.menuDate);
    res.json({ success: true, data: menus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDailyMenusByEvent = async (req, res) => {
  try {
    const menus = await DailyMenu.findByEvent(req.params.eventId);
    res.json({ success: true, data: menus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateDailyMenu = async (req, res) => {
  try {
    const updated = await DailyMenu.update(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteDailyMenu = async (req, res) => {
  try {
    await DailyMenu.delete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.listDailyMenuDates = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dates = await DailyMenu.listDates(startDate, endDate);
    res.json({ success: true, data: dates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEventsWithMenus = async (req, res) => {
  try {
    const events = await DailyMenu.listEventsWithMenus();
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
