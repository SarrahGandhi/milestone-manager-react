import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_BACKEND_URL || "http://localhost:5001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}/api` // Full URL in production
  : "/api";

console.log("Mode:", import.meta.env.MODE);
console.log("VITE_BACKEND_URL:", import.meta.env.VITE_BACKEND_URL);
console.log("Final API_BASE_URL:", API_BASE_URL);
