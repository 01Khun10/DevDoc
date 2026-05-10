function Badge({ children, tone = "slate" }) {
  const classes =
    tone === "amber"
      ? "bg-amber-50 text-amber-700 ring-amber-100"
      : "bg-slate-100 text-slate-700 ring-slate-200";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${classes}`}>
      {children}
    </span>
  );
}

function HelperBlock({ title, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-slate-950">{title}</h3>
        <span className="h-2 w-2 rounded-full bg-teal-500" aria-hidden="true" />
      </div>
      <div className="mt-4 grid gap-4">{children}</div>
    </section>
  );
}

function TextBlock({ label, children }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm leading-6 text-slate-700">{children}</p>
    </div>
  );
}

function DocumentGuidancePanel({ section }) {
  if (!section) {
    return (
      <aside className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        Select a section to view guidance.
      </aside>
    );
  }

  return (
    <aside className="grid gap-4 xl:sticky xl:top-24 xl:max-h-[calc(100vh-8rem)] xl:overflow-y-auto">
      <HelperBlock title="Section Guidance">
        <TextBlock label="Description">{section.description || "No description provided."}</TextBlock>
        <TextBlock label="Guidance">{section.guidanceText || "No guidance provided."}</TextBlock>
        <TextBlock label="Example">{section.exampleText || "No example provided."}</TextBlock>
        <TextBlock label="Placeholder">
          {section.placeholderText || "No placeholder provided."}
        </TextBlock>
      </HelperBlock>

      <HelperBlock title="Validation">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {section.isRequired ? "Required" : "Optional"}
          </p>
          <div className="mt-2">
            <Badge tone={section.isRequired ? "amber" : "slate"}>
              {section.isRequired ? "Required" : "Optional"}
            </Badge>
          </div>
        </div>
        <p className="rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700">
          Validation issues will appear in a later phase.
        </p>
      </HelperBlock>

      <HelperBlock title="Linked Artefacts">
        <p className="rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700">
          Linked artefacts will appear in a later phase.
        </p>
      </HelperBlock>
    </aside>
  );
}

export default DocumentGuidancePanel;
