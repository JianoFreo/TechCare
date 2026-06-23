import { ENV } from "./config/env.js";
import adminRoutes from "./routes/admin.route.js";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// FIX __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());

// API routes
app.use("/api/admin", adminRoutes);

// Test route


const frontendPath = path.resolve(__dirname, "../../frontend/dist");

app.use(express.static(frontendPath));

app.use((req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// IMPORTANT: Render needs process.env.PORT
const PORT = ENV.PORT || process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});