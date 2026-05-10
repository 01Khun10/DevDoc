function Badge({ children, tone = "slate" }) {
  const colorMap = {
    teal:    { bg: "rgba(20,184,166,0.12)", border: "rgba(20,184,166,0.35)", color: "#0d9488" },
    emerald: { bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.35)", color: "#059669" },
    amber:   { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)", color: "#b45309" },
    slate:   { bg: "var(--devdoc-surface-muted)", border: "var(--devdoc-border)", color: "var(--devdoc-muted)" },
  };
  const s = colorMap[tone] || colorMap.slate;
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-xs font-bold"
      style={{ backgroundColor: s.bg, border: `1px solid ${s.border}`, color: s.color }}
    >
      {children}
    </span>
  );
}

function getStatusIcon(status) {
  return status === "COMPLETE" ? "Done" : "Open";
}

function DocumentSectionSidebar({
  sections,
  selectedSectionId,
  onSelectSection,
  completionPercent,
  completedCount,
}) {
  const totalSections = sections.length;
  const localCompletedCount =
    completedCount ?? sections.filter((section) => section.status === "COMPLETE").length;
  const localCompletionPercent =
    completionPercent ??
    (totalSections === 0 ? 0 : Math.round((localCompletedCount / totalSections) * 100));

  return (
    <aside
      className="overflow-hidden rounded-2xl shadow-[var(--devdoc-shadow-soft)]"
      style={{ border: "1px solid var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
    >
      <div
        className="border-b p-4"
        style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface-muted)" }}
      >
        <p className="devdoc-label">Section rail</p>
        <div className="mt-2 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-bold" style={{ color: "var(--devdoc-text)" }}>Document sections</h2>
            <p className="mt-1 text-xs" style={{ color: "var(--devdoc-muted)" }}>
              {localCompletedCount} / {totalSections} complete
            </p>
          </div>
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-bold"
            style={{
              backgroundColor: "var(--devdoc-primary-soft)",
              color: "var(--devdoc-primary)"
            }}
          >
            {localCompletionPercent}%
          </span>
        </div>
        <div
          className="mt-3 h-1.5 overflow-hidden rounded-full"
          style={{ backgroundColor: "var(--devdoc-border)" }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${localCompletionPercent}%`, backgroundColor: "var(--devdoc-primary)" }}
          />
        </div>
      </div>

      <div className="grid max-h-[calc(100vh-18rem)] gap-1.5 overflow-y-auto p-3">
        {sections.length === 0 ? (
          <p
            className="rounded-md border border-dashed p-4 text-sm"
            style={{ borderColor: "var(--devdoc-border)", color: "var(--devdoc-muted)" }}
          >
            No sections are available for this document.
          </p>
        ) : null}

        {sections.map((section) => {
          const isSelected = section.id === selectedSectionId;
          const isComplete = section.status === "COMPLETE";

          return (
            <button
              key={section.id}
            className="w-full rounded-2xl p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
              style={{
                border: `1px solid ${isSelected ? "var(--devdoc-primary)" : "var(--devdoc-border)"}`,
                backgroundColor: isSelected ? "var(--devdoc-primary-soft)" : "var(--devdoc-surface)",
                outline: isSelected ? `2px solid var(--devdoc-primary-soft)` : "none",
              }}
              type="button"
              onClick={() => onSelectSection(section)}
            >
              <div className="flex items-start gap-3">
                <span
                  className="flex h-9 min-w-9 items-center justify-center rounded-xl text-xs font-bold"
                  style={{
                    backgroundColor: isSelected ? "var(--devdoc-primary)" : "var(--devdoc-surface-muted)",
                    color: isSelected ? "#ffffff" : "var(--devdoc-text)",
                  }}
                >
                  {section.sectionNumber}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide"
                      style={{ color: isComplete ? "var(--devdoc-success)" : "var(--devdoc-muted)" }}
                      aria-hidden="true"
                    >
                      {getStatusIcon(section.status)}
                    </span>
                    <p className="devdoc-label">Section</p>
                  </div>
                  <h3
                    className="mt-1 line-clamp-2 text-sm font-semibold leading-5"
                    style={{ color: "var(--devdoc-text)" }}
                  >
                    {section.title}
                  </h3>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone={section.isRequired ? "amber" : "slate"}>
                  {section.isRequired ? "Required" : "Optional"}
                </Badge>
                <Badge tone={isComplete ? "emerald" : "slate"}>{section.status || "EMPTY"}</Badge>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

export default DocumentSectionSidebar;
