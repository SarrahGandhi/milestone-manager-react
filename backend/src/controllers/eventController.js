const Event = require("../models/Event");

// Get all events
const getAllEvents = async (req, res) => {
  try {
    const { status, category, startDate, endDate } = req.query;
    let filters = {};

    // Add filters if provided
    if (status) filters.status = status;
    if (category) filters.category = category;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const events = await Event.findAll(filters);
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single event by ID
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new event
const createEvent = async (req, res) => {
  try {
    // Validate event data
    const validationErrors = Event.validateEventData(req.body);
    if (validationErrors.length > 0) {
      return res
        .status(400)
        .json({ message: "Validation Error", errors: validationErrors });
    }

    const savedEvent = await Event.create(req.body);
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    // Validate event data
    const validationErrors = Event.validateEventData(req.body);
    if (validationErrors.length > 0) {
      return res
        .status(400)
        .json({ message: "Validation Error", errors: validationErrors });
    }

    const event = await Event.update(req.params.id, req.body);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const success = await Event.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get events by status
const getEventsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const events = await Event.findAll({ status });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get upcoming events
const getUpcomingEvents = async (req, res) => {
  try {
    const events = await Event.findUpcoming();

    // Filter only published events for public access
    const publishedEvents = events.filter(
      (event) => event.status === "published"
    );

    // Format dates and times for frontend
    const formattedEvents = publishedEvents.map((event) => ({
      ...event,
      formattedDate: new Date(event.eventDate).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      formattedTime: `${event.startTime}${
        event.endTime ? ` - ${event.endTime}` : ""
      }`,
    }));

    res.json(formattedEvents);
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update event status
const updateEventStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const event = await Event.update(req.params.id, { status });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsByStatus,
  getUpcomingEvents,
  updateEventStatus,
};
