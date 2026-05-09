const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

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

app.get("/", (req, res) => {
  res.json({ message: "DevDoc API running" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "DevDoc API" });
});

app.listen(PORT, () => {
  console.log(`DevDoc API listening on port ${PORT}`);
});
