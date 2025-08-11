const { supabase } = require("../config/database");

class Budget {
  // Create a new budget item
  static async create(budgetData) {
    try {
      const { data, error } = await supabase
        .from("budgets")
        .insert([
          {
            description: budgetData.description,
            category: budgetData.category,
            event_id: budgetData.eventId,
            estimated_cost: budgetData.estimatedCost,
            actual_cost: budgetData.actualCost || 0,
            notes: budgetData.notes,
            user_id: budgetData.userId,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return this.formatBudget(data);
    } catch (error) {
      throw error;
    }
  }

  // Find budget item by ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from("budgets")
        .select(
          `
          *,
          event:events(id, title, event_date),
          user:users(id, username, first_name, last_name)
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return data ? this.formatBudget(data) : null;
    } catch (error) {
      throw error;
    }
  }

  // Find all budget items with filters
  static async findAll(filters = {}) {
    try {
      let query = supabase
        .from("budgets")
        .select(
          `
          *,
          event:events(id, title, event_date),
          user:users(id, username, first_name, last_name)
        `
        )
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters.userId) {
        query = query.eq("user_id", filters.userId);
      }
      if (filters.eventId) {
        query = query.eq("event_id", filters.eventId);
      }
      if (filters.category) {
        query = query.eq("category", filters.category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data.map((budget) => this.formatBudget(budget));
    } catch (error) {
      throw error;
    }
  }

  // Update budget item
  static async update(id, updates) {
    try {
      // Convert camelCase to snake_case for database
      const dbUpdates = {};
      Object.keys(updates).forEach((key) => {
        switch (key) {
          case "eventId":
            dbUpdates.event_id = updates[key];
            break;
          case "estimatedCost":
            dbUpdates.estimated_cost = updates[key];
            break;
          case "actualCost":
            dbUpdates.actual_cost = updates[key];
            break;
          case "userId":
            dbUpdates.user_id = updates[key];
            break;
          default:
            dbUpdates[key] = updates[key];
        }
      });

      const { data, error } = await supabase
        .from("budgets")
        .update(dbUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return this.formatBudget(data);
    } catch (error) {
      throw error;
    }
  }

  // Delete budget item
  static async delete(id) {
    try {
      const { error } = await supabase.from("budgets").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Find budgets by event
  static async findByEvent(eventId) {
    try {
      const { data, error } = await supabase
        .from("budgets")
        .select(
          `
          *,
          event:events(id, title, event_date),
          user:users(id, username, first_name, last_name)
        `
        )
        .eq("event_id", eventId)
        .order("category", { ascending: true });

      if (error) throw error;
      return data.map((budget) => this.formatBudget(budget));
    } catch (error) {
      throw error;
    }
  }

  // Find budgets by user
  static async findByUser(userId) {
    try {
      const { data, error } = await supabase
        .from("budgets")
        .select(
          `
          *,
          event:events(id, title, event_date),
          user:users(id, username, first_name, last_name)
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data.map((budget) => this.formatBudget(budget));
    } catch (error) {
      throw error;
    }
  }

  // Get budget summary by event
  static async getBudgetSummary(eventId) {
    try {
      const { data, error } = await supabase
        .from("budgets")
        .select("category, estimated_cost, actual_cost")
        .eq("event_id", eventId);

      if (error) throw error;

      const summary = {
        totalEstimated: 0,
        totalActual: 0,
        categoryBreakdown: {},
        variance: 0,
        variancePercentage: 0,
      };

      data.forEach((budget) => {
        summary.totalEstimated += budget.estimated_cost;
        summary.totalActual += budget.actual_cost;

        if (!summary.categoryBreakdown[budget.category]) {
          summary.categoryBreakdown[budget.category] = {
            estimated: 0,
            actual: 0,
          };
        }
        summary.categoryBreakdown[budget.category].estimated +=
          budget.estimated_cost;
        summary.categoryBreakdown[budget.category].actual += budget.actual_cost;
      });

      summary.variance = summary.totalActual - summary.totalEstimated;
      summary.variancePercentage =
        summary.totalEstimated > 0
          ? (summary.variance / summary.totalEstimated) * 100
          : 0;

      return summary;
    } catch (error) {
      throw error;
    }
  }

  // Get budget summary by user
  static async getBudgetSummaryByUser(userId) {
    try {
      const { data, error } = await supabase
        .from("budgets")
        .select("category, estimated_cost, actual_cost, event_id")
        .eq("user_id", userId);

      if (error) throw error;

      const summary = {
        totalEstimated: 0,
        totalActual: 0,
        categoryBreakdown: {},
        eventBreakdown: {},
        variance: 0,
        variancePercentage: 0,
      };

      data.forEach((budget) => {
        summary.totalEstimated += budget.estimated_cost;
        summary.totalActual += budget.actual_cost;

        // Category breakdown
        if (!summary.categoryBreakdown[budget.category]) {
          summary.categoryBreakdown[budget.category] = {
            estimated: 0,
            actual: 0,
          };
        }
        summary.categoryBreakdown[budget.category].estimated +=
          budget.estimated_cost;
        summary.categoryBreakdown[budget.category].actual += budget.actual_cost;

        // Event breakdown
        if (!summary.eventBreakdown[budget.event_id]) {
          summary.eventBreakdown[budget.event_id] = {
            estimated: 0,
            actual: 0,
          };
        }
        summary.eventBreakdown[budget.event_id].estimated +=
          budget.estimated_cost;
        summary.eventBreakdown[budget.event_id].actual += budget.actual_cost;
      });

      summary.variance = summary.totalActual - summary.totalEstimated;
      summary.variancePercentage =
        summary.totalEstimated > 0
          ? (summary.variance / summary.totalEstimated) * 100
          : 0;

      return summary;
    } catch (error) {
      throw error;
    }
  }

  // Format budget data for frontend
  static formatBudget(budget) {
    if (!budget) return null;

    const formatted = { ...budget };

    // Convert snake_case back to camelCase for frontend
    if (formatted.event_id) {
      formatted.eventId = formatted.event_id;
      delete formatted.event_id;
    }
    if (formatted.estimated_cost) {
      formatted.estimatedCost = formatted.estimated_cost;
      delete formatted.estimated_cost;
    }
    if (formatted.actual_cost) {
      formatted.actualCost = formatted.actual_cost;
      delete formatted.actual_cost;
    }
    if (formatted.user_id) {
      formatted.userId = formatted.user_id;
      delete formatted.user_id;
    }
    if (formatted.created_at) {
      formatted.createdAt = formatted.created_at;
      delete formatted.created_at;
    }
    if (formatted.updated_at) {
      formatted.updatedAt = formatted.updated_at;
      delete formatted.updated_at;
    }

    // Calculate variance
    formatted.variance = formatted.actualCost - formatted.estimatedCost;
    formatted.variancePercentage =
      formatted.estimatedCost > 0
        ? (formatted.variance / formatted.estimatedCost) * 100
        : 0;

    return formatted;
  }

  // Validate budget data
  static validateBudgetData(budgetData) {
    const errors = [];

    if (!budgetData.description || budgetData.description.trim().length === 0) {
      errors.push("Description is required");
    }

    if (!budgetData.category) {
      errors.push("Category is required");
    }

    if (
      ![
        "Venue",
        "Catering",
        "Decor",
        "Entertainment",
        "Photography",
        "Attire",
        "Transportation",
        "Gifts",
        "Other",
      ].includes(budgetData.category)
    ) {
      errors.push("Invalid category");
    }

    if (!budgetData.eventId) {
      errors.push("Event ID is required");
    }

    if (!budgetData.userId) {
      errors.push("User ID is required");
    }

    if (
      budgetData.estimatedCost === undefined ||
      budgetData.estimatedCost < 0
    ) {
      errors.push("Estimated cost must be a non-negative number");
    }

    if (budgetData.actualCost !== undefined && budgetData.actualCost < 0) {
      errors.push("Actual cost must be a non-negative number");
    }

    return errors;
  }
}

module.exports = Budget;
