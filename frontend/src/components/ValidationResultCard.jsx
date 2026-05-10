const severityStyles = {
  ERROR: "border-red-200 bg-red-50 text-red-800",
  WARNING: "border-amber-200 bg-amber-50 text-amber-800",
  INFO: "border-sky-200 bg-sky-50 text-sky-800"
};

const ruleLabels = {
  "DOC-001": "Document coverage",
  "DOC-002": "Document progress",
  "REQ-001": "Requirement coverage",
  "REQ-002": "Use case coverage",
  "SEC-001": "Required section",
  "TRC-001": "Requirement traceability",
  "TRC-002": "Broken traceability",
  "UC-001": "Use case coverage",
  "UC-002": "Use case to requirement",
  "UC-003": "Use case documentation"
};

function formatTargetType(targetType) {
  if (!targetType) {
    return "";
  }

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
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${severityClass}`}>
          {result.severity}
        </span>
        <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {result.ruleCode}
        </span>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
          {ruleLabel}
        </span>
        {targetTypeLabel ? (
          <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
            {targetTypeLabel}
          </span>
        ) : null}
      </div>

      <p className="mt-4 text-sm font-semibold leading-6 text-slate-950">{result.message}</p>

      {result.suggestedFix ? (
        <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase text-slate-500">Suggested fix</p>
          <p className="mt-1 text-sm leading-6 text-slate-700">{result.suggestedFix}</p>
        </div>
      ) : null}
    </article>
  );
}

export default ValidationResultCard;
