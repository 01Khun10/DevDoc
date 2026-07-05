const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");
const projectRoutes = require("./routes/projectRoutes");
const requirementRoutes = require("./routes/requirementRoutes");
const templateRoutes = require("./routes/templateRoutes");
const traceabilityRoutes = require("./routes/traceabilityRoutes");
const useCaseRoutes = require("./routes/useCaseRoutes");
const validationRoutes = require("./routes/validationRoutes");
const diagramRoutes = require("./routes/diagramRoutes");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(helmet());
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: "Too many attempts, please try again later" } }
});

app.use("/api/auth", authRateLimiter, authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/projects/:projectId/documents", documentRoutes);
app.use("/api/projects/:projectId/requirements", requirementRoutes);
app.use("/api/projects/:projectId/use-cases", useCaseRoutes);
app.use("/api/projects/:projectId/traceability", traceabilityRoutes);
app.use("/api/projects/:projectId/validation", validationRoutes);
app.use("/api/projects/:projectId/diagrams", diagramRoutes);
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
