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
const businessObjectiveRoutes = require("./routes/businessObjectiveRoutes");
const templateRoutes = require("./routes/templateRoutes");
const traceabilityRoutes = require("./routes/traceabilityRoutes");
const useCaseRoutes = require("./routes/useCaseRoutes");
const designElementRoutes = require("./routes/designElementRoutes");
const testCaseRoutes = require("./routes/testCaseRoutes");
const validationRoutes = require("./routes/validationRoutes");
const diagramRoutes = require("./routes/diagramRoutes");
const searchRoutes = require("./routes/searchRoutes");
const shareController = require("./controllers/shareController");
const { sendError, sendUnexpectedError } = require("./utils/httpErrors");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGINS = new Set((process.env.FRONTEND_URL || "").split(",").map((origin) => origin.trim()).filter(Boolean));
if (process.env.NODE_ENV !== "production") {
  FRONTEND_ORIGINS.add("http://localhost:5173");
  FRONTEND_ORIGINS.add("http://127.0.0.1:5173");
}

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => callback(null, !origin || FRONTEND_ORIGINS.has(origin)),
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

app.use(["/api/auth/login", "/api/auth/register"], authRateLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/projects/:projectId/documents", documentRoutes);
app.use("/api/projects/:projectId/requirements", requirementRoutes);
app.use("/api/projects/:projectId/business-objectives", businessObjectiveRoutes);
app.use("/api/projects/:projectId/use-cases", useCaseRoutes);
app.use("/api/projects/:projectId/design-elements", designElementRoutes);
app.use("/api/projects/:projectId/test-cases", testCaseRoutes);
app.use("/api/projects/:projectId/traceability", traceabilityRoutes);
app.use("/api/projects/:projectId/validation", validationRoutes);
app.use("/api/projects/:projectId/diagrams", diagramRoutes);
app.use("/api/templates", templateRoutes);

// Public read-only share report (no auth) — rate limited.
const sharedRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: "Too many requests, please try again later" } }
});
app.get("/api/shared/:token", sharedRateLimiter, shareController.getReport);

app.get("/", (req, res) => {
  res.json({ message: "DevDoc API running" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "DevDoc API" });
});

const ERROR_STATUS_BY_CODE = {
  PROJECT_NOT_FOUND: 404,
  PROFILE_NOT_FOUND: 404,
  TEMPLATE_NOT_FOUND: 404,
  DOCUMENT_NOT_FOUND: 404,
  SECTION_NOT_FOUND: 404,
  REQUIREMENT_NOT_FOUND: 404,
  BUSINESS_OBJECTIVE_NOT_FOUND: 404,
  USE_CASE_NOT_FOUND: 404,
  DESIGN_ELEMENT_NOT_FOUND: 404,
  TEST_CASE_NOT_FOUND: 404,
  SOURCE_NOT_FOUND: 404,
  TARGET_NOT_FOUND: 404,
  LINK_NOT_FOUND: 404,
  RUN_NOT_FOUND: 404,
  PROFILE_MISMATCH: 400,
  UNSUPPORTED_LINK_TYPE: 400,
  DUPLICATE_LINK: 409,
  DUPLICATE_EMAIL: 409,
  INVALID_CREDENTIALS: 401,
  WRONG_PASSWORD: 400
};

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const status = ERROR_STATUS_BY_CODE[error.code];

  if (status) {
    return sendError(res, status, error.message);
  }

  if (error.type === "entity.parse.failed" || error.type === "entity.too.large") {
    return sendError(res, 400, "Invalid request body");
  }

  return sendUnexpectedError(res, error, "globalErrorHandler");
});

app.listen(PORT, () => {
  console.log(`DevDoc API listening on port ${PORT}`);
});
