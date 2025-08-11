// Validate UUID format
const isValidUUID = (id) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

// Validate required fields
const validateRequired = (fields, data) => {
  const errors = [];
  fields.forEach((field) => {
    if (
      !data[field] ||
      (typeof data[field] === "string" && data[field].trim() === "")
    ) {
      errors.push(`${field} is required`);
    }
  });
  return errors;
};

// Validate field lengths
const validateLength = (field, value, min = 0, max = Infinity) => {
  if (typeof value !== "string") return [];
  const length = value.trim().length;
  const errors = [];

  if (length < min) {
    errors.push(`${field} must be at least ${min} characters long`);
  }
  if (length > max) {
    errors.push(`${field} cannot exceed ${max} characters`);
  }

  return errors;
};

// Validate enum values
const validateEnum = (field, value, allowedValues) => {
  if (!allowedValues.includes(value)) {
    return [`${field} must be one of: ${allowedValues.join(", ")}`];
  }
  return [];
};

// Validate numeric values
const validateNumeric = (field, value, min = -Infinity, max = Infinity) => {
  const errors = [];
  const numValue = Number(value);

  if (isNaN(numValue)) {
    errors.push(`${field} must be a valid number`);
    return errors;
  }

  if (numValue < min) {
    errors.push(`${field} must be at least ${min}`);
  }
  if (numValue > max) {
    errors.push(`${field} cannot exceed ${max}`);
  }

  return errors;
};

module.exports = {
  isValidUUID,
  isValidEmail,
  validateRequired,
  validateLength,
  validateEnum,
  validateNumeric,
  // Keep old function names for backward compatibility
  validateObjectId: isValidUUID,
  isValidObjectId: isValidUUID,
};
