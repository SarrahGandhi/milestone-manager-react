import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Budget.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faDollarSign,
  faChartPie,
} from "@fortawesome/free-solid-svg-icons";
import BudgetService from "../../../services/budgetService";
import AddBudgetForm from "./AddBudgetForm";
import EditBudgetForm from "./EditBudgetForm";
import DeleteBudgetModal from "./DeleteBudgetModal";

const Budget = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [budgetItems, setBudgetItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    itemId: null,
    itemDescription: "",
  });
  const navigate = useNavigate();

  // Budget categories
  const categories = [
    "Venue",
    "Catering",
    "Decor",
    "Entertainment",
    "Photography",
    "Attire",
    "Transportation",
    "Gifts",
    "Other",
  ];

  // Fetch events from the database
  const fetchEvents = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/events");
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        console.error("Failed to fetch events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  // Fetch budget items
  const fetchBudgetItems = async () => {
    try {
      setLoading(true);
      setError("");

      let data;
      if (selectedEvent === "all") {
        data = await BudgetService.getAllBudgetItems();
      } else {
        data = await BudgetService.getBudgetItemsByEvent(selectedEvent);
      }

      setBudgetItems(data);
    } catch (error) {
      console.error("Error fetching budget items:", error);
      setError(error.message || "Failed to fetch budget items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchBudgetItems();
  }, [selectedEvent]); // Refetch when selected event changes

  // Handle adding a new budget item
  const handleAddItem = () => {
    setShowAddForm(true);
  };

  // Handle editing a budget item
  const handleEditItem = (item) => {
    setEditingItem(item);
  };

  // Handle deleting a budget item
  const handleDeleteItem = (itemId, itemDescription) => {
    setDeleteModal({
      isOpen: true,
      itemId,
      itemDescription,
    });
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      await BudgetService.deleteBudgetItem(deleteModal.itemId);
      setDeleteModal({ isOpen: false, itemId: null, itemDescription: "" });
      fetchBudgetItems(); // Refresh the list
    } catch (error) {
      console.error("Error deleting budget item:", error);
      setError("Failed to delete budget item");
    }
  };

  // Handle form close
  const handleFormClose = () => {
    setShowAddForm(false);
    setEditingItem(null);
    fetchBudgetItems(); // Refresh the list
  };

  // Filter budget items based on search query, event, and category
  const filteredBudgetItems = budgetItems.filter((item) => {
    const matchesSearch =
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Calculate totals
  const totals = filteredBudgetItems.reduce(
    (acc, item) => ({
      estimated: acc.estimated + (parseFloat(item.estimatedCost) || 0),
      actual: acc.actual + (parseFloat(item.actualCost) || 0),
    }),
    { estimated: 0, actual: 0 }
  );

  // Calculate category totals for the selected event
  const categoryTotals = categories.map((category) => {
    const categoryItems = filteredBudgetItems.filter(
      (item) => item.category === category
    );
    return {
      category,
      estimated: categoryItems.reduce(
        (sum, item) => sum + (parseFloat(item.estimatedCost) || 0),
        0
      ),
      actual: categoryItems.reduce(
        (sum, item) => sum + (parseFloat(item.actualCost) || 0),
        0
      ),
    };
  });

  if (loading) {
    return (
      <div className="budget-root">
        <div className="loading-message">Loading budget...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="budget-root">
        <div className="error-message">
          {error}
          <button onClick={fetchBudgetItems} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="budget-root">
      <div className="budget-header">
        <div className="budget-header-row">
          <button className="add-budget-btn" onClick={handleAddItem}>
            <FontAwesomeIcon icon={faPlus} />
            Add Budget Item
          </button>
          <input
            type="text"
            placeholder="Search budget items..."
            className="budget-search-bar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Controls */}
        <div className="filter-controls">
          <div className="category-filter">
            <label>Category:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="event-filter">
            <label>Event:</label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Events</option>
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <FontAwesomeIcon icon={faDollarSign} className="summary-icon" />
            <div className="summary-content">
              <div className="summary-number">
                ${totals.estimated.toLocaleString()}
              </div>
              <div className="summary-label">Estimated Total</div>
            </div>
          </div>
          <div className="summary-card">
            <FontAwesomeIcon icon={faDollarSign} className="summary-icon" />
            <div className="summary-content">
              <div className="summary-number">
                ${totals.actual.toLocaleString()}
              </div>
              <div className="summary-label">Actual Total</div>
            </div>
          </div>
          <div className="summary-card">
            <FontAwesomeIcon icon={faChartPie} className="summary-icon" />
            <div className="summary-content">
              <div className="summary-number">
                ${(totals.actual - totals.estimated).toLocaleString()}
              </div>
              <div className="summary-label">Difference</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Summary Table */}
      <div className="category-summary">
        <h3>Category Summary</h3>
        <table className="category-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Estimated Cost</th>
              <th>Actual Cost</th>
              <th>Difference</th>
            </tr>
          </thead>
          <tbody>
            {categoryTotals.map((cat) => (
              <tr key={cat.category}>
                <td>{cat.category}</td>
                <td>${cat.estimated.toLocaleString()}</td>
                <td>${cat.actual.toLocaleString()}</td>
                <td
                  className={
                    cat.actual - cat.estimated > 0
                      ? "over-budget"
                      : "under-budget"
                  }
                >
                  ${(cat.actual - cat.estimated).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Budget Items Table */}
      <div className="budget-table-container">
        {filteredBudgetItems.length === 0 ? (
          <div className="no-budget-items-message">
            {searchQuery || categoryFilter !== "all"
              ? "No budget items match your filters."
              : "No budget items yet. Add your first budget item!"}
          </div>
        ) : (
          <table className="budget-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Event</th>
                <th>Estimated Cost</th>
                <th>Actual Cost</th>
                <th>Difference</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBudgetItems.map((item) => {
                const difference =
                  (parseFloat(item.actualCost) || 0) -
                  (parseFloat(item.estimatedCost) || 0);
                const event = events.find((e) => e._id === item.eventId);

                return (
                  <tr key={item._id}>
                    <td>{item.description}</td>
                    <td>
                      <span
                        className={`category-badge ${item.category.toLowerCase()}`}
                      >
                        {item.category}
                      </span>
                    </td>
                    <td>{event ? event.title : "-"}</td>
                    <td>${parseFloat(item.estimatedCost).toLocaleString()}</td>
                    <td>${parseFloat(item.actualCost).toLocaleString()}</td>
                    <td
                      className={
                        difference > 0 ? "over-budget" : "under-budget"
                      }
                    >
                      ${difference.toLocaleString()}
                    </td>
                    <td className="notes-cell">
                      {item.notes ? (
                        <span title={item.notes}>
                          {item.notes.length > 30
                            ? `${item.notes.substring(0, 30)}...`
                            : item.notes}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="actions-cell">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEditItem(item)}
                        title="Edit Item"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() =>
                          handleDeleteItem(item._id, item.description)
                        }
                        title="Delete Item"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      {showAddForm && (
        <AddBudgetForm
          onClose={handleFormClose}
          events={events}
          categories={categories}
        />
      )}

      {editingItem && (
        <EditBudgetForm
          budgetItem={editingItem}
          onClose={handleFormClose}
          events={events}
          categories={categories}
        />
      )}

      {deleteModal.isOpen && (
        <DeleteBudgetModal
          isOpen={deleteModal.isOpen}
          itemDescription={deleteModal.itemDescription}
          onConfirm={confirmDelete}
          onClose={() =>
            setDeleteModal({
              isOpen: false,
              itemId: null,
              itemDescription: "",
            })
          }
        />
      )}
    </div>
  );
};

export default Budget;
