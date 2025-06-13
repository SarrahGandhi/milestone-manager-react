const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const budgetController = require("../controllers/budgetController");

// Get all budget items
router.get("/", authenticateToken, budgetController.getAllBudgetItems);

// Get budget items for a specific event
router.get(
  "/event/:eventId",
  authenticateToken,
  budgetController.getBudgetItemsByEvent
);

// Create a new budget item
router.post("/", authenticateToken, budgetController.createBudgetItem);

// Update a budget item
router.put("/:id", authenticateToken, budgetController.updateBudgetItem);

// Delete a budget item
router.delete("/:id", authenticateToken, budgetController.deleteBudgetItem);

// Get budget summary
router.get("/summary", authenticateToken, budgetController.getBudgetSummary);

// Get category totals (optionally filtered by event)
router.get(
  "/categories/:eventId?",
  authenticateToken,
  budgetController.getCategoryTotals
);

module.exports = router;
