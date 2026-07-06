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

// React code
//     │
//     ▼
// api.get("/api/fdstaff/patients")
//     │
//     ▼
// Browser sends request to
// http://localhost:5173/api/fdstaff/patients
//     │
//     ▼
// Vite (running on 5173) receives it
//     │
//     ▼
// Vite proxy forwards it to
// http://localhost:5000/api/fdstaff/patients
//     │
//     ▼
// Express handles the request