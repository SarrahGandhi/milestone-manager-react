// API Configuration
// Check if we're in development mode and use local backend
const isDevelopment =
  import.meta.env.DEV || window.location.hostname === "localhost";

export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}/api`
  : isDevelopment
  ? "http://localhost:5001/api" // Local backend for development
  : "https://milestone-manager-react.onrender.com/api"; // Production backend

console.log("  isDevelopment:", isDevelopment);
console.log("  VITE_BACKEND_URL:", import.meta.env.VITE_BACKEND_URL);
console.log("  API_BASE_URL:", API_BASE_URL);

// Helper function to get the full API URL for a specific endpoint
export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;

// Other configuration constants can be added here
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
