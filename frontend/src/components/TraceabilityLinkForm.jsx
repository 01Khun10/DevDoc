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

function TraceabilityLinkForm({
  requirements,
  documentSections,
  links,
  selectedRequirementId,
  onSelectRequirement,
  onToggleSection,
  processingSectionId,
  error,
}) {
  const selectedRequirement =
    requirements.find((requirement) => requirement.id === selectedRequirementId) || null;

  function isRequirementLinked(requirementId) {
    return links.some((link) => link.sourceId === requirementId);
  }

  function getLinkForSection(sectionId) {
    if (!selectedRequirement) {
      return null;
    }

    return (
      links.find(
        (link) => link.sourceId === selectedRequirement.id && link.targetId === sectionId
      ) || null
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <h2 className="text-lg font-bold text-slate-950">Build traceability links</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Select a requirement, then click document sections to connect or disconnect them.
        </p>
        <div className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          Link type: described_by
        </div>
      </div>

      {error ? (
        <div className="mx-5 mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-0 lg:grid-cols-[minmax(18rem,0.9fr)_minmax(0,1.4fr)]">
        <div className="border-b border-slate-200 p-5 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">
              Requirements
            </h3>
            <Badge tone="slate">{requirements.length} total</Badge>
          </div>

          <div className="mt-4 grid max-h-[34rem] gap-3 overflow-y-auto pr-1">
            {requirements.map((requirement) => {
              const isSelected = requirement.id === selectedRequirementId;
              const linked = isRequirementLinked(requirement.id);

              return (
                <button
                  key={requirement.id}
                  className={`rounded-xl border p-4 text-left transition ${
                    isSelected
                      ? "border-teal-500 bg-teal-50 shadow-sm ring-2 ring-teal-100"
                      : "border-slate-200 bg-white hover:border-teal-200 hover:bg-slate-50"
                  }`}
                  type="button"
                  onClick={() => onSelectRequirement(requirement.id)}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-teal-700">{requirement.code}</span>
                    <Badge tone="slate">{requirement.type}</Badge>
                    <Badge tone={linked ? "emerald" : "amber"}>
                      {linked ? "Linked" : "Unlinked"}
                    </Badge>
                  </div>
                  <h4 className="mt-3 text-sm font-semibold leading-5 text-slate-950">
                    {requirement.title}
                  </h4>
                  <p className="mt-2 text-xs font-semibold uppercase text-slate-500">
                    {requirement.status}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">
              Document Sections
            </h3>
            <Badge tone="slate">{documentSections.length} available</Badge>
          </div>

          {!selectedRequirement ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-600">
              Select a requirement to see document sections.
            </div>
          ) : (
            <div className="mt-4 grid max-h-[34rem] gap-3 overflow-y-auto pr-1">
              <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
                Linking sections for{" "}
                <span className="font-semibold text-slate-950">
                  {selectedRequirement.code} - {selectedRequirement.title}
                </span>
              </div>

              {documentSections.map((section) => {
                const existingLink = getLinkForSection(section.id);
                const isLinked = Boolean(existingLink);
                const isProcessing = processingSectionId === section.id;

                return (
                  <button
                    key={section.id}
                    className={`rounded-xl border p-4 text-left transition disabled:cursor-wait disabled:opacity-70 ${
                      isLinked
                        ? "border-emerald-400 bg-emerald-50 shadow-sm ring-2 ring-emerald-100"
                        : "border-slate-200 bg-white hover:border-teal-200 hover:bg-slate-50"
                    }`}
                    disabled={isProcessing}
                    type="button"
                    onClick={() => onToggleSection(section)}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-950">
                        {section.document?.title || "Untitled document"}
                      </span>
                      <Badge tone="teal">{section.document?.documentType || "DOC"}</Badge>
                      <Badge tone={isLinked ? "emerald" : "slate"}>
                        {isProcessing ? "Working..." : isLinked ? "Linked" : "Click to link"}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-950">
                      Section {section.sectionNumber} - {section.title}
                    </p>
                    <p className="mt-2 text-xs font-semibold uppercase text-slate-500">
                      {section.status}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default TraceabilityLinkForm;
