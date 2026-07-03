import express from "express";
import path from "path";
import multer from "multer";
const upload = multer({
  dest: "uploads/",
});

// import { initializeWebSocket } from "./websocket.js";
import { fileURLToPath } from "url";
import { connectNeon } from "./config/db.js";
import { ENV } from "./config/env.js";
import adminRoutes from "./routes/admin.route.js";
import authRoutes from "./routes/auth.route.js";
import testRoutes from "./routes/test.routes.js";

// FIX __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());

// API routes
app.use("/api/test", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
// Test route

const frontendPath = path.resolve(__dirname, "../../frontend/dist");

app.use(express.static(frontendPath));

app.use((req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// IMPORTANT: Render needs process.env.PORT

connectNeon().then(() => {
  const server = app.listen(ENV.PORT, () => {
    console.log(`Server is up and running on http://localhost:${ENV.PORT}`);
  });
  // initializeWebSocket(server);
});
