// API Configuration
// Use environment variable if available, otherwise fall back to relative URL for proxy
export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}/api`
  : "/api";

// Helper function to get the full API URL for a specific endpoint
export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;

// Other configuration constants can be added here
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
