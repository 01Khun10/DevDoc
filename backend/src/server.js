const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const templateRoutes = require("./routes/templateRoutes");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: FRONTEND_URL
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/templates", templateRoutes);

app.get("/", (req, res) => {
  res.json({ message: "DevDoc API running" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "DevDoc API" });
});

app.listen(PORT, () => {
  console.log(`DevDoc API listening on port ${PORT}`);
});
