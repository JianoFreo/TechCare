import express from "express";
import { ENV } from "./config/env.js";
import adminRoutes from "./routes/admin.route.js";
import path from "path";

const app = express();

app.use(express.json());

app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the TechCare API!" });
});


// React build
app.use(express.static(path.join(__dirname, "../../../frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../../frontend/dist/index.html"));
});
app.listen(ENV.PORT, () => {
  console.log(`Server is running on http://localhost:${ENV.PORT}`);
});
