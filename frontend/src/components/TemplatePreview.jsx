function Badge({ children, tone = "slate" }) {
  const classes =
    tone === "teal"
      ? "bg-teal-50 text-teal-700 ring-teal-100"
      : "bg-slate-100 text-slate-700 ring-slate-200";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${classes}`}>
      {children}
    </span>
  );
}

function TemplatePreview({ template, sections, isLoading, error }) {
  if (isLoading) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        Loading template preview...
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error}
      </section>
    );
  }

  if (!template) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        Select a template to preview its sections.
      </section>
    );
  }

  const requiredCount = sections.filter((section) => section.isRequired).length;
  const optionalCount = sections.length - requiredCount;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-950">{template.name}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{template.description}</p>
          <p className="mt-4 text-xs font-semibold uppercase text-slate-500">Recommended for</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{template.recommendedFor}</p>
        </div>
        <Badge>{template.documentType}</Badge>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Total sections</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">{sections.length}</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Required sections</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">{requiredCount}</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Optional sections</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">{optionalCount}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {sections.map((section) => (
          <article
            key={section.id}
            className="rounded-md border border-slate-200 bg-white p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Section {section.sectionNumber}
                </p>
                <h3 className="mt-1 text-base font-semibold text-slate-950">{section.title}</h3>
              </div>
              <Badge tone={section.isRequired ? "teal" : "slate"}>
                {section.isRequired ? "Required" : "Optional"}
              </Badge>
            </div>
            {section.description ? (
              <p className="mt-3 text-sm leading-6 text-slate-600">{section.description}</p>
            ) : null}
            {section.guidanceText ? (
              <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                <span className="font-semibold text-slate-950">Guidance: </span>
                {section.guidanceText}
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <p className="mt-6 rounded-md bg-teal-50 p-4 text-sm font-medium text-teal-800">
        Document creation will be available in the next phase.
      </p>
    </section>
  );
}

export default TemplatePreview;
