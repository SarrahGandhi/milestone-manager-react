const Budget = require("../models/Budget");

// UUID validation helper
const isValidUUID = (uuid) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Get all budget items for a user
exports.getAllBudgetItems = async (req, res) => {
  try {
    const budgetItems = await Budget.findByUser(req.user.id);
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

    if (!isValidUUID(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const budgetItems = await Budget.findByEvent(eventId);
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

    console.log("Budget item data received:", req.body);
    console.log("User ID:", req.user.id);

    if (!eventId) {
      return res.status(400).json({ message: "Event ID is required" });
    }

    if (!isValidUUID(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    // Validate budget data
    const budgetData = {
      description,
      category,
      eventId,
      estimatedCost: parseFloat(estimatedCost) || 0,
      actualCost: parseFloat(actualCost) || 0,
      notes,
      userId: req.user.id,
    };

    const errors = Budget.validateBudgetData(budgetData);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join(", ") });
    }

    console.log("Budget item before saving:", budgetData);

    const budgetItem = await Budget.create(budgetData);

    console.log("Budget item after saving:", budgetItem);

    res.status(201).json(budgetItem);
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

    if (!isValidUUID(id)) {
      return res.status(400).json({ message: "Invalid budget item ID" });
    }

    if (eventId && !isValidUUID(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    // Check if budget item exists and belongs to user
    const existingBudget = await Budget.findById(id);
    if (!existingBudget || existingBudget.userId !== req.user.id) {
      return res.status(404).json({ message: "Budget item not found" });
    }

    const updates = {};
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (eventId !== undefined) updates.eventId = eventId;
    if (estimatedCost !== undefined)
      updates.estimatedCost = parseFloat(estimatedCost);
    if (actualCost !== undefined) updates.actualCost = parseFloat(actualCost);
    if (notes !== undefined) updates.notes = notes;

    const updatedBudgetItem = await Budget.update(id, updates);

    res.json(updatedBudgetItem);
  } catch (error) {
    console.error("Error in updateBudgetItem:", error);
    res.status(500).json({ message: "Error updating budget item" });
  }
};

// Delete a budget item
exports.deleteBudgetItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ message: "Invalid budget item ID" });
    }

    // Check if budget item exists and belongs to user
    const existingBudget = await Budget.findById(id);
    if (!existingBudget || existingBudget.userId !== req.user.id) {
      return res.status(404).json({ message: "Budget item not found" });
    }

    await Budget.delete(id);

    res.json({ message: "Budget item deleted successfully" });
  } catch (error) {
    console.error("Error in deleteBudgetItem:", error);
    res.status(500).json({ message: "Error deleting budget item" });
  }
};

// Get budget summary
exports.getBudgetSummary = async (req, res) => {
  try {
    const summary = await Budget.getBudgetSummaryByUser(req.user.id);

    // Add item count
    const budgetItems = await Budget.findByUser(req.user.id);
    summary.itemCount = budgetItems.length;

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

    if (eventId && !isValidUUID(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    let summary;
    if (eventId) {
      summary = await Budget.getBudgetSummary(eventId);
    } else {
      summary = await Budget.getBudgetSummaryByUser(req.user.id);
    }

    // Transform the category breakdown to match expected format
    const categoryTotals = {};
    Object.keys(summary.categoryBreakdown).forEach((category) => {
      categoryTotals[category] = {
        estimated: summary.categoryBreakdown[category].estimated,
        actual: summary.categoryBreakdown[category].actual,
        count: 1, // This would need to be calculated separately if needed
      };
    });

    res.json(categoryTotals);
  } catch (error) {
    console.error("Error in getCategoryTotals:", error);
    res.status(500).json({ message: "Error fetching category totals" });
  }
};
