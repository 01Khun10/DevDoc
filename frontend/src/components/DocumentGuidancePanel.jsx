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

function DocumentGuidancePanel({ 
  section, 
  writingIssues, 
  linkedArtefacts, 
  isLoadingLinkedArtefacts, 
  linkedArtefactsError 
}) {
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

      <HelperBlock title="Writing Helper">
        {writingIssues ? (
          <ul className="space-y-2 pl-4">
            {writingIssues.map((issue, i) => (
              <li key={i} className={`text-sm leading-6 ${issue.includes("No obvious") ? "text-emerald-700" : "text-amber-700 list-disc"}`}>
                {issue}
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700">
            Run Review → Writing Check to see suggestions.
          </p>
        )}
      </HelperBlock>

      <HelperBlock title="Linked Artefacts">
        {isLoadingLinkedArtefacts ? (
          <p className="text-sm text-slate-500">Loading linked artefacts...</p>
        ) : linkedArtefactsError ? (
          <p className="text-sm text-red-600">{linkedArtefactsError}</p>
        ) : linkedArtefacts?.summary?.hasLinks ? (
          <div className="grid gap-4">
            {linkedArtefacts.requirements.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Requirements</p>
                <div className="grid gap-2">
                  {linkedArtefacts.requirements.map((req) => (
                    <div key={req.id} className="flex flex-col gap-1 rounded-md border border-slate-200 bg-slate-50 p-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">{req.code}</span>
                        <Badge tone={req.status === 'APPROVED' ? 'emerald' : req.status === 'IMPLEMENTED' ? 'teal' : 'slate'}>
                          {req.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-800">{req.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {linkedArtefacts.useCases.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Use Cases</p>
                <div className="grid gap-2">
                  {linkedArtefacts.useCases.map((uc) => (
                    <div key={uc.id} className="flex flex-col gap-1 rounded-md border border-slate-200 bg-slate-50 p-2 shadow-sm">
                      <span className="text-xs font-bold text-slate-700">{uc.code}</span>
                      <p className="text-sm text-slate-800">{uc.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700">
            No linked artefacts yet. Use the Traceability Matrix to connect this section to requirements or use cases.
          </p>
        )}
      </HelperBlock>

      <HelperBlock title="Validation Hints">
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {section.isRequired ? "Required" : "Optional"}
          </p>
          <div className="mt-2">
            <Badge tone={section.isRequired ? "amber" : "slate"}>
              {section.isRequired ? "Required" : "Optional"}
            </Badge>
          </div>
        </div>

        {section.isRequired && linkedArtefacts && !linkedArtefacts.summary.hasLinks ? (
          <p className="mt-2 rounded-lg bg-amber-50 p-3 text-sm leading-6 text-amber-800 ring-1 ring-amber-200">
            This required section is not linked to any artefact yet.
          </p>
        ) : null}

        {linkedArtefacts?.summary?.requirementCount > 0 ? (
          <p className="mt-2 rounded-lg bg-emerald-50 p-3 text-sm leading-6 text-emerald-800 ring-1 ring-emerald-200">
            This section is connected to requirements.
          </p>
        ) : null}

        {linkedArtefacts?.summary?.useCaseCount > 0 ? (
          <p className="mt-2 rounded-lg bg-emerald-50 p-3 text-sm leading-6 text-emerald-800 ring-1 ring-emerald-200">
            This section is connected to use cases.
          </p>
        ) : null}
      </HelperBlock>
    </aside>
  );
}

export default DocumentGuidancePanel;
