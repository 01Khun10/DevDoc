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
const shareController = require("./controllers/shareController");
const { sendError, sendUnexpectedError } = require("./utils/httpErrors");

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
  INVALID_CREDENTIALS: 401
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
