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
  "SEC-001": "Required section",
  "TRC-001": "Requirement traceability",
  "TRC-002": "Broken traceability",
  "UC-001":  "Use case coverage",
  "UC-002":  "Use case to requirement",
  "UC-003":  "Use case documentation"
};

function formatTargetType(targetType) {
  if (!targetType) return "";
  return targetType
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function ValidationResultCard({ result }) {
  const severityClass = severityStyles[result.severity] || severityStyles.INFO;
  const targetTypeLabel = formatTargetType(result.targetType);
  const ruleLabel = ruleLabels[result.ruleCode] || "Doc-Linter check";

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
    </article>
  );
}

export default ValidationResultCard;
