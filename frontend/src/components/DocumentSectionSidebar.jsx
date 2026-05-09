function StatusBadge({ children, tone = "slate" }) {
  const classes =
    tone === "teal"
      ? "bg-teal-50 text-teal-700 ring-teal-100"
      : tone === "emerald"
        ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
        : "bg-slate-100 text-slate-700 ring-slate-200";

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${classes}`}>
      {children}
    </span>
  );
}

function DocumentSectionSidebar({ sections, selectedSectionId, onSelectSection }) {
  const completedCount = sections.filter((section) => section.status === "COMPLETE").length;
  const completionPercent =
    sections.length === 0 ? 0 : Math.round((completedCount / sections.length) * 100);

  return (
    <div className="rounded-md border border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-3">
        <h3 className="text-sm font-semibold text-slate-950">Document sections</h3>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>{completedCount} complete</span>
            <span>{completionPercent}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-teal-600 transition-all"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid max-h-[380px] gap-2 overflow-y-auto p-3">
        {sections.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
            No sections are available for this document.
          </p>
        ) : null}

        {sections.map((section) => {
          const isSelected = section.id === selectedSectionId;

          return (
            <button
              key={section.id}
              className={`w-full rounded-md border p-3 text-left transition ${
                isSelected
                  ? "border-teal-400 bg-teal-50 shadow-sm ring-2 ring-teal-100"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
              type="button"
              onClick={() => onSelectSection(section)}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-8 min-w-8 items-center justify-center rounded-md text-xs font-bold ${
                    isSelected ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {section.sectionNumber}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase text-slate-500">Section</p>
                  <h3 className="mt-1 text-sm font-semibold leading-5 text-slate-950">
                    {section.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-500">
                    {section.status === "COMPLETE" ? "Saved content" : "No saved content yet"}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge tone={section.isRequired ? "teal" : "slate"}>
                  {section.isRequired ? "Required" : "Optional"}
                </StatusBadge>
                <StatusBadge tone={section.status === "COMPLETE" ? "emerald" : "slate"}>
                  {section.status}
                </StatusBadge>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default DocumentSectionSidebar;
