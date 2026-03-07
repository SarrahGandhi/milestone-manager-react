const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const {
  getVendors,
  createVendor,
  updateVendor,
  deleteVendor,
} = require("../controllers/vendorController");

router.get("/", authenticateToken, getVendors);
router.post("/", authenticateToken, createVendor);
router.put("/:id", authenticateToken, updateVendor);
router.delete("/:id", authenticateToken, deleteVendor);

module.exports = router;
