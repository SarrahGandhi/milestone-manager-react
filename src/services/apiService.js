// API configuration
const API_BASE_URL = "/api";

export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;

export const getHeaders = (token) => ({
  "Content-Type": "application/json",
  ...(token && { Authorization: `Bearer ${token}` }),
});

export default {
  getApiUrl,
  getHeaders,
};
