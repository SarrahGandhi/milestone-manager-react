const mongoose = require("mongoose");

// Validate MongoDB ObjectId
exports.validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};
