import { Link } from "react-router-dom";

const severityStyles = {
  ERROR: {
    border: "color-mix(in srgb, var(--devdoc-error) 35%, var(--devdoc-border))",
    background: "var(--devdoc-error-soft)",
    color: "var(--devdoc-error)"
  },
  WARNING: {
    border: "color-mix(in srgb, var(--devdoc-warning) 35%, var(--devdoc-border))",
    background: "var(--devdoc-warning-soft)",
    color: "var(--devdoc-warning)"
  },
  INFO: {
    border: "color-mix(in srgb, var(--devdoc-info) 35%, var(--devdoc-border))",
    background: "var(--devdoc-info-soft)",
    color: "var(--devdoc-info)"
  }
};

const ruleLabels = {
  "DOC-001": "Document coverage",
  "DOC-002": "Document progress",
  "REQ-001": "Requirement coverage",
  "REQ-002": "Use case coverage",
  "REQ-003": "Design coverage",
  "REQ-004": "Test coverage",
  "SEC-001": "Required section",
  "TRC-001": "Requirement traceability",
  "TRC-002": "Broken traceability",
  "TRC-003": "Stale traceability link",
  "TRC-004": "Objective to use case",
  "BO-001":  "Business objectives",
  "UC-001":  "Use case coverage",
  "UC-002":  "Use case to requirement",
  "UC-003":  "Use case documentation",
  "QUA-001": "Vague wording",
  "QUA-002": "Acceptance criteria",
  "QUA-003": "Shall statement"
};

// Matrix mode preselected by the "Open in matrix" action, per rule.
const matrixModeByRule = {
  "REQ-002": "USE_CASE_REQUIREMENT",
  "REQ-003": "REQUIREMENT_DESIGN_ELEMENT",
  "REQ-004": "REQUIREMENT_TEST_CASE",
  "TRC-001": "REQUIREMENT_DOCUMENT_SECTION",
  "UC-001": "USE_CASE_REQUIREMENT",
  "UC-002": "USE_CASE_REQUIREMENT",
  "UC-003": "USE_CASE_DOCUMENT_SECTION",
  "TRC-004": "BUSINESS_OBJECTIVE_USE_CASE"
};

function formatTargetType(targetType) {
  if (!targetType) return "";
  return targetType
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

// Deep link for a result's stored target: section results open the editor
// scrolled to the section, artifacts open their registry highlighted, and
// link rules open the matrix with the source preselected.
function getTargetAction(result, projectId, sectionDocumentMap) {
  const { targetType, targetId, ruleCode } = result;
  if (!targetType || !targetId) return null;
  const base = `/projects/${projectId}`;

  if (targetType === "DOCUMENT_SECTION") {
    const documentId = sectionDocumentMap?.[targetId];
    if (!documentId) return null;
    return { label: "Open section", to: `${base}/documents/${documentId}?highlight=${targetId}` };
  }

  const matrixMode = matrixModeByRule[ruleCode];

  if (targetType === "REQUIREMENT") {
    if (matrixMode || ruleCode.startsWith("TRC")) {
      return {
        label: "Open in matrix",
        to: `${base}/traceability?mode=${matrixMode || "REQUIREMENT_DOCUMENT_SECTION"}&source=${targetId}`
      };
    }
    return { label: "View requirement", to: `${base}/requirements?highlight=${targetId}` };
  }

  if (targetType === "USE_CASE") {
    if (matrixMode) {
      return { label: "Open in matrix", to: `${base}/traceability?mode=${matrixMode}&source=${targetId}` };
    }
    return { label: "View use case", to: `${base}/use-cases?highlight=${targetId}` };
  }

  if (targetType === "BUSINESS_OBJECTIVE") {
    if (matrixMode) {
      return { label: "Open in matrix", to: `${base}/traceability?mode=${matrixMode}&source=${targetId}` };
    }
    return { label: "View objective", to: `${base}/business-objectives?highlight=${targetId}` };
  }

  if (targetType === "DESIGN_ELEMENT") {
    return { label: "View design element", to: `${base}/design-elements?highlight=${targetId}` };
  }

  if (targetType === "TEST_CASE") {
    return { label: "View test case", to: `${base}/test-cases?highlight=${targetId}` };
  }

  if (targetType === "DOCUMENT") {
    return { label: "Open document", to: `${base}/documents/${targetId}` };
  }

  if (targetType === "TRACEABILITY_LINK") {
    return { label: "Open in matrix", to: `${base}/traceability` };
  }

  return null;
}

function ValidationResultCard({ result, projectId, sectionDocumentMap, onCreateCoveringUseCase }) {
  const severityClass = severityStyles[result.severity] || severityStyles.INFO;
  const targetTypeLabel = formatTargetType(result.targetType);
  const ruleLabel = ruleLabels[result.ruleCode] || "Doc-Linter check";
  const targetAction = projectId ? getTargetAction(result, projectId, sectionDocumentMap) : null;
  const showCoveringFix =
    result.ruleCode === "REQ-002" &&
    result.targetType === "REQUIREMENT" &&
    Boolean(onCreateCoveringUseCase);

  return (
    <article className="devdoc-card-border p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="rounded-md border px-2.5 py-0.5 text-xs font-bold"
          style={{
            borderColor: severityClass.border,
            backgroundColor: severityClass.background,
            color: severityClass.color
          }}
        >
          {result.severity}
        </span>
        <span
          className="rounded-full border px-2.5 py-0.5 text-xs font-bold text-[var(--devdoc-muted)]"
          style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface-muted)" }}
        >
          {ruleLabel}
        </span>
        {targetTypeLabel ? (
          <span
            className="rounded-full border px-2.5 py-0.5 text-xs font-bold"
            style={{
              borderColor: "rgba(20,184,166,0.35)",
              backgroundColor: "rgba(20,184,166,0.12)",
              color: "var(--devdoc-primary)"
            }}
          >
            {targetTypeLabel}
          </span>
        ) : null}
      </div>

      <p className="mt-4 text-sm font-semibold leading-6" style={{ color: "var(--devdoc-text)" }}>
        {result.message}
      </p>

      {result.suggestedFix ? (
        <div className="devdoc-inset mt-4">
          <p className="devdoc-label">Suggested fix</p>
          <p className="mt-1 text-sm leading-6 text-[var(--devdoc-muted)]">{result.suggestedFix}</p>
        </div>
      ) : null}

      {showCoveringFix || targetAction ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {showCoveringFix ? (
            <button
              className="rounded-lg px-3 py-1.5 text-xs font-bold text-white transition"
              style={{ backgroundColor: "var(--devdoc-primary)" }}
              type="button"
              onClick={() => onCreateCoveringUseCase(result)}
            >
              Create covering use case
            </button>
          ) : null}
          {targetAction ? (
            <Link
              className="rounded-lg border px-3 py-1.5 text-xs font-bold transition"
              style={{
                borderColor: "var(--devdoc-border)",
                backgroundColor: "var(--devdoc-surface)",
                color: "var(--devdoc-primary)"
              }}
              to={targetAction.to}
            >
              {targetAction.label}
            </Link>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export default ValidationResultCard;
