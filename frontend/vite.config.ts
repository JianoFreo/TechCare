import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const target =
  !process.env.NODE_ENV
    ? "https://techcare-hui6.onrender.com"
    : "http://localhost:5000";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target,
        changeOrigin: true,
      },
    },
  },
});