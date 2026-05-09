import DocumentSectionSidebar from "./DocumentSectionSidebar";

function Badge({ children, tone = "slate" }) {
  const classes =
    tone === "teal"
      ? "bg-teal-50 text-teal-700 ring-teal-100"
      : tone === "emerald"
        ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
        : "bg-slate-100 text-slate-700 ring-slate-200";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${classes}`}>
      {children}
    </span>
  );
}

function ToolButton({ label, isActive = false }) {
  return (
    <button
      className={`flex w-full items-center justify-center rounded-md px-2 py-2 text-xs font-semibold transition sm:w-auto xl:w-full ${
        isActive
          ? "bg-teal-700 text-white shadow-sm"
          : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
      }`}
      title={isActive ? label : `${label} tools will appear in a later phase.`}
      type="button"
    >
      {label}
    </button>
  );
}

function HelperBlock({ title, children }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function TextBlock({ label, children }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm leading-6 text-slate-700">{children}</p>
    </div>
  );
}

function DocumentGuidancePanel({
  document,
  section,
  sections,
  selectedSectionId,
  onSelectSection
}) {
  const completedCount = sections.filter((currentSection) => currentSection.status === "COMPLETE").length;
  const emptyCount = sections.length - completedCount;

  return (
    <aside className="rounded-lg border border-slate-200 bg-slate-50 shadow-sm xl:sticky xl:top-6 xl:max-h-[calc(100vh-3rem)] xl:overflow-hidden">
      <div className="border-b border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase text-slate-500">DevDoc tools</p>
        <h2 className="mt-1 text-lg font-bold text-slate-950">Helper sidebar</h2>
      </div>

      <div className="grid gap-3 p-3 sm:grid-cols-5 xl:grid-cols-[86px_minmax(0,1fr)] xl:items-start">
        <nav className="grid gap-2 sm:col-span-5 sm:grid-cols-5 xl:col-span-1 xl:grid-cols-1">
          <ToolButton label="Sections" isActive />
          <ToolButton label="Guidance" />
          <ToolButton label="Validation" />
          <ToolButton label="Analytics" />
          <ToolButton label="Linked Artefacts" />
        </nav>

        <div className="grid max-h-[calc(100vh-10rem)] gap-3 overflow-y-auto sm:col-span-5 xl:col-span-1">
          <HelperBlock title="Sections">
            <DocumentSectionSidebar
              sections={sections}
              selectedSectionId={selectedSectionId}
              onSelectSection={onSelectSection}
            />
          </HelperBlock>

          <HelperBlock title="Guidance">
            {section ? (
              <div className="grid gap-4">
                <TextBlock label="Description">
                  {section.description || "No description provided."}
                </TextBlock>
                <TextBlock label="Guidance">{section.guidanceText || "No guidance provided."}</TextBlock>
                <TextBlock label="Example">{section.exampleText || "No example provided."}</TextBlock>
                <TextBlock label="Placeholder">
                  {section.placeholderText || "No placeholder provided."}
                </TextBlock>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    {section.isRequired ? "Required" : "Optional"}
                  </p>
                  <div className="mt-2">
                    <Badge tone={section.isRequired ? "teal" : "slate"}>
                      {section.isRequired ? "Required" : "Optional"}
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600">Select a section to view guidance.</p>
            )}
          </HelperBlock>

          <HelperBlock title="Validation">
            <p className="text-sm leading-6 text-slate-700">
              Validation issues will appear in a later phase.
            </p>
          </HelperBlock>

          <HelperBlock title="Analytics">
            <div className="grid gap-3 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span>Completion</span>
                <Badge tone={document?.completionPercent === 100 ? "emerald" : "slate"}>
                  {document?.completionPercent || 0}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Complete sections</span>
                <span className="font-semibold text-slate-950">{completedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Empty sections</span>
                <span className="font-semibold text-slate-950">{emptyCount}</span>
              </div>
            </div>
          </HelperBlock>

          <HelperBlock title="Linked Artefacts">
            <p className="text-sm leading-6 text-slate-700">
              Linked artefacts will appear in a later phase.
            </p>
          </HelperBlock>
        </div>
      </div>
    </aside>
  );
}

export default DocumentGuidancePanel;
