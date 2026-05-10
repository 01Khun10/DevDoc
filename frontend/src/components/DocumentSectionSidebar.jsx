function Badge({ children, tone = "slate" }) {
  const classes =
    tone === "teal"
      ? "bg-teal-50 text-teal-700 ring-teal-100"
      : tone === "emerald"
        ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
        : tone === "amber"
          ? "bg-amber-50 text-amber-700 ring-amber-100"
          : "bg-slate-100 text-slate-700 ring-slate-200";

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${classes}`}>
      {children}
    </span>
  );
}

function getStatusIcon(status) {
  return status === "COMPLETE" ? "✓" : "○";
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
    <aside className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Section rail</p>
        <div className="mt-2 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Document sections</h2>
            <p className="mt-1 text-xs text-slate-500">
              {localCompletedCount} / {totalSections} complete
            </p>
          </div>
          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 ring-1 ring-teal-100">
            {localCompletionPercent}%
          </span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-teal-600 transition-all"
            style={{ width: `${localCompletionPercent}%` }}
          />
        </div>
      </div>

      <div className="grid max-h-[calc(100vh-18rem)] gap-2 overflow-y-auto p-3">
        {sections.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
            No sections are available for this document.
          </p>
        ) : null}

        {sections.map((section) => {
          const isSelected = section.id === selectedSectionId;
          const isComplete = section.status === "COMPLETE";

          return (
            <button
              key={section.id}
              className={`w-full rounded-lg border p-3 text-left transition ${
                isSelected
                  ? "border-teal-500 bg-teal-50 shadow-sm ring-2 ring-teal-100"
                  : "border-slate-200 bg-white hover:border-teal-200 hover:bg-slate-50"
              }`}
              type="button"
              onClick={() => onSelectSection(section)}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-9 min-w-9 items-center justify-center rounded-md text-xs font-bold ${
                    isSelected ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {section.sectionNumber}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-base font-bold ${
                        isComplete ? "text-emerald-700" : "text-slate-400"
                      }`}
                      aria-hidden="true"
                    >
                      {getStatusIcon(section.status)}
                    </span>
                    <p className="text-xs font-semibold uppercase text-slate-500">Section</p>
                  </div>
                  <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-slate-950">
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
