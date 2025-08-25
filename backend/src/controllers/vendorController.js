const Vendor = require("../models/Vendor");
const getVendors = async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      status: req.query.status,
      eventId: req.query.eventId,
      search: req.query.search,
    };
    const vendors = await Vendor.findAll(filters, req.user?.id);
    res.json(vendors);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ error: "Failed to fetch vendors" });
  }
};

const createVendor = async (req, res) => {
  try {
    console.log("Creating vendor:", { body: req.body, userId: req.user?.id });
    const vendor = await Vendor.create(req.body, req.user?.id);
    console.log("Vendor created:", vendor);
    res.status(201).json(vendor);
  } catch (error) {
    console.error("Error creating vendor:", error);
    res.status(400).json({ error: error.message || "Failed to create vendor" });
  }
};

const updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Vendor id is required" });
    const updated = await Vendor.update(id, req.body || {});
    res.json(updated);
  } catch (error) {
    console.error("Error updating vendor:", error);
    res.status(400).json({ error: error.message || "Failed to update vendor" });
  }
};

const deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Vendor id is required" });
    await Vendor.delete(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting vendor:", error);
    res.status(400).json({ error: error.message || "Failed to delete vendor" });
  }
};

module.exports = { getVendors, createVendor, updateVendor, deleteVendor };
