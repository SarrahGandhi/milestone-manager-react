const Budget = require("../models/Budget");
const mongoose = require("mongoose");

// Get all budget items for a user
exports.getAllBudgetItems = async (req, res) => {
  try {
    const budgetItems = await Budget.find({ userId: req.user._id })
      .populate("eventId", "title")
      .sort({ createdAt: -1 });
    res.json(budgetItems);
  } catch (error) {
    console.error("Error in getAllBudgetItems:", error);
    res.status(500).json({ message: "Error fetching budget items" });
  }
};

// Get budget items for a specific event
exports.getBudgetItemsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const budgetItems = await Budget.find({
      userId: req.user._id,
      eventId: eventId,
    }).populate("eventId", "title");

    res.json(budgetItems);
  } catch (error) {
    console.error("Error in getBudgetItemsByEvent:", error);
    res.status(500).json({ message: "Error fetching budget items for event" });
  }
};

// Create a new budget item
exports.createBudgetItem = async (req, res) => {
  try {
    const { description, category, eventId, estimatedCost, actualCost, notes } =
      req.body;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const budgetItem = new Budget({
      description,
      category,
      eventId,
      estimatedCost,
      actualCost: actualCost || 0,
      notes,
      userId: req.user._id,
    });

    await budgetItem.save();

    const populatedBudgetItem = await Budget.findById(budgetItem._id).populate(
      "eventId",
      "title"
    );

    res.status(201).json(populatedBudgetItem);
  } catch (error) {
    console.error("Error in createBudgetItem:", error);
    res.status(500).json({ message: "Error creating budget item" });
  }
};

// Update a budget item
exports.updateBudgetItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, category, eventId, estimatedCost, actualCost, notes } =
      req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid budget item ID" });
    }

    if (eventId && !mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const budgetItem = await Budget.findOne({ _id: id, userId: req.user._id });

    if (!budgetItem) {
      return res.status(404).json({ message: "Budget item not found" });
    }

    budgetItem.description = description || budgetItem.description;
    budgetItem.category = category || budgetItem.category;
    budgetItem.eventId = eventId || budgetItem.eventId;
    budgetItem.estimatedCost = estimatedCost || budgetItem.estimatedCost;
    budgetItem.actualCost =
      actualCost !== undefined ? actualCost : budgetItem.actualCost;
    budgetItem.notes = notes !== undefined ? notes : budgetItem.notes;
    budgetItem.updatedAt = Date.now();

    await budgetItem.save();

    const populatedBudgetItem = await Budget.findById(budgetItem._id).populate(
      "eventId",
      "title"
    );

    res.json(populatedBudgetItem);
  } catch (error) {
    console.error("Error in updateBudgetItem:", error);
    res.status(500).json({ message: "Error updating budget item" });
  }
};

// Delete a budget item
exports.deleteBudgetItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid budget item ID" });
    }

    const budgetItem = await Budget.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!budgetItem) {
      return res.status(404).json({ message: "Budget item not found" });
    }

    res.json({ message: "Budget item deleted successfully" });
  } catch (error) {
    console.error("Error in deleteBudgetItem:", error);
    res.status(500).json({ message: "Error deleting budget item" });
  }
};

// Get budget summary
exports.getBudgetSummary = async (req, res) => {
  try {
    const budgetItems = await Budget.find({ userId: req.user._id });

    const summary = {
      totalEstimated: 0,
      totalActual: 0,
      difference: 0,
      itemCount: budgetItems.length,
    };

    budgetItems.forEach((item) => {
      summary.totalEstimated += item.estimatedCost;
      summary.totalActual += item.actualCost;
    });

    summary.difference = summary.totalActual - summary.totalEstimated;

    res.json(summary);
  } catch (error) {
    console.error("Error in getBudgetSummary:", error);
    res.status(500).json({ message: "Error fetching budget summary" });
  }
};

// Get category totals
exports.getCategoryTotals = async (req, res) => {
  try {
    const { eventId } = req.params;
    let query = { userId: req.user._id };

    if (eventId) {
      if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      query.eventId = eventId;
    }

    const budgetItems = await Budget.find(query);

    const categoryTotals = {};

    budgetItems.forEach((item) => {
      if (!categoryTotals[item.category]) {
        categoryTotals[item.category] = {
          estimated: 0,
          actual: 0,
          count: 0,
        };
      }

      categoryTotals[item.category].estimated += item.estimatedCost;
      categoryTotals[item.category].actual += item.actualCost;
      categoryTotals[item.category].count += 1;
    });

    res.json(categoryTotals);
  } catch (error) {
    console.error("Error in getCategoryTotals:", error);
    res.status(500).json({ message: "Error fetching category totals" });
  }
};
