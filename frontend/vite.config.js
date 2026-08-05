import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// When VITE_API_BASE_URL is a full URL (e.g. Cloud Shell backend URL),
// the frontend hits the backend directly — no proxy needed.
// When it is "/api" (default), Vite proxies /api → localhost:5000.
const apiBase = process.env.VITE_API_BASE_URL || "/api";
const needsProxy = apiBase === "/api" || apiBase.startsWith("/");

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: "0.0.0.0",
    allowedHosts: "all",
    ...(needsProxy && {
      proxy: {
        "/api": {
          target: "http://localhost:5000",
          changeOrigin: true,
        },
      },
    }),
  },
});
