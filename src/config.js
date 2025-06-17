// API Configuration
// Always use environment variable - no relative URL fallback
export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}/api`
  : "https://milestone-manager-react.onrender.com/api"; // Default to production backend

// Debug logging (remove this later)
console.log("🐛 DEBUG CONFIG:");
console.log("  VITE_BACKEND_URL:", import.meta.env.VITE_BACKEND_URL);
console.log("  API_BASE_URL:", API_BASE_URL);

// Helper function to get the full API URL for a specific endpoint
export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;

// Other configuration constants can be added here
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
