const BADGE = {
  teal:  { bg: "rgba(20,184,166,0.12)", border: "rgba(20,184,166,0.35)", color: "#0d9488" },
  slate: { bg: "var(--devdoc-surface-muted)", border: "var(--devdoc-border)", color: "var(--devdoc-muted)" },
};

function Badge({ children, tone = "slate" }) {
  const s = BADGE[tone] || BADGE.slate;
  return (
    <span
      className="rounded-md px-2.5 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: s.bg, border: `1px solid ${s.border}`, color: s.color }}
    >
      {children}
    </span>
  );
}

function StatPill({ label, value }) {
  return (
    <div
      className="rounded-md p-4"
      style={{ border: "1px solid var(--devdoc-border)", backgroundColor: "var(--devdoc-surface-inset)" }}
    >
      <p className="devdoc-label">{label}</p>
      <p className="mt-1 text-2xl font-bold" style={{ color: "var(--devdoc-text)" }}>{value}</p>
    </div>
  );
}

function TemplatePreview({ template, sections, isLoading, error, onCreateDocument, isCreating, createError }) {
  if (isLoading) {
    return (
      <section
      className="devdoc-card-border p-6 text-sm"
        style={{ border: "1px solid var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)", color: "var(--devdoc-muted)" }}
      >
        Loading template preview...
      </section>
    );
  }

  if (error) {
    return (
      <section
      className="rounded-2xl p-6 text-sm font-medium"
        style={{ backgroundColor: "rgba(207,34,46,0.08)", border: "1px solid rgba(207,34,46,0.35)", color: "var(--devdoc-error)" }}
      >
        {error}
      </section>
    );
  }

  if (!template) {
    return (
      <section
      className="devdoc-card-border p-6 text-sm"
        style={{ border: "1px solid var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)", color: "var(--devdoc-muted)" }}
      >
        Select a template to preview its sections.
      </section>
    );
  }

  const requiredCount = sections.filter((s) => s.isRequired).length;
  const optionalCount = sections.length - requiredCount;

  return (
    <section
      className="rounded-2xl p-6 shadow-[var(--devdoc-shadow)]"
      style={{ border: "1px solid var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
    >
      <div
        className="flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-start sm:justify-between"
        style={{ borderColor: "var(--devdoc-border)" }}
      >
        <div>
          <h2 className="font-headline text-xl font-extrabold" style={{ color: "var(--devdoc-text)" }}>{template.name}</h2>
          <p className="mt-3 text-sm leading-6" style={{ color: "var(--devdoc-muted)" }}>{template.description}</p>
          <p className="mt-4 devdoc-label">Recommended for</p>
          <p className="mt-1 text-sm leading-6" style={{ color: "var(--devdoc-muted)" }}>{template.recommendedFor}</p>
        </div>
        <Badge tone="teal">{template.documentType}</Badge>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <StatPill label="Total sections" value={sections.length} />
        <StatPill label="Required sections" value={requiredCount} />
        <StatPill label="Optional sections" value={optionalCount} />
      </div>

      <div className="mt-6 grid gap-4">
        {sections.map((section) => (
          <article
            key={section.id}
            className="rounded-2xl p-4"
            style={{ border: "1px solid var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="devdoc-label">Section {section.sectionNumber}</p>
                <h3 className="mt-1 text-base font-bold" style={{ color: "var(--devdoc-text)" }}>{section.title}</h3>
              </div>
              <Badge tone={section.isRequired ? "teal" : "slate"}>{section.isRequired ? "Required" : "Optional"}</Badge>
            </div>
            {section.description ? (
              <p className="mt-3 text-sm leading-6" style={{ color: "var(--devdoc-muted)" }}>{section.description}</p>
            ) : null}
            {section.guidanceText ? (
              <div
                className="mt-3 rounded-xl p-3 text-sm leading-6"
                style={{ backgroundColor: "var(--devdoc-surface-inset)", border: "1px solid var(--devdoc-border)", color: "var(--devdoc-muted)" }}
              >
                <span className="font-semibold" style={{ color: "var(--devdoc-text)" }}>Guidance: </span>
                {section.guidanceText}
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <div
        className="mt-6 rounded-2xl p-4"
        style={{ border: "1px solid var(--devdoc-primary)", backgroundColor: "var(--devdoc-primary-soft)" }}
      >
        <button className="devdoc-gradient-button" type="button" disabled={isCreating} onClick={onCreateDocument}>
          {isCreating ? "Creating document..." : "Create Document"}
        </button>
        {createError ? (
          <p className="mt-3 text-sm font-medium" style={{ color: "var(--devdoc-error)" }}>{createError}</p>
        ) : null}
      </div>
    </section>
  );
}

export default TemplatePreview;
