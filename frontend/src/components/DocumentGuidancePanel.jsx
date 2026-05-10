function Badge({ children, tone = "slate" }) {
  const color =
    tone === "amber"
      ? "var(--devdoc-warning)"
      : tone === "emerald" || tone === "teal"
        ? "var(--devdoc-success)"
        : "var(--devdoc-muted)";

  return (
    <span
      className="rounded-md border px-3 py-1 text-xs font-semibold"
      style={{
        backgroundColor: "color-mix(in srgb, currentColor 12%, transparent)",
        borderColor: "color-mix(in srgb, currentColor 35%, var(--devdoc-border))",
        color,
      }}
    >
      {children}
    </span>
  );
}

function HelperBlock({ title, children }) {
  return (
    <section className="devdoc-card-border rounded-lg p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-[var(--devdoc-text)]">{title}</h3>
        <span className="h-2 w-2 rounded-full bg-[var(--devdoc-primary)]" aria-hidden="true" />
      </div>
      <div className="mt-4 grid gap-4">{children}</div>
    </section>
  );
}

function TextBlock({ label, children }) {
  return (
    <div>
      <p className="devdoc-label">{label}</p>
      <p className="mt-1 text-sm leading-6 text-[var(--devdoc-text)]">{children}</p>
    </div>
  );
}

function ToneMessage({ tone = "neutral", children }) {
  const color =
    tone === "success"
      ? "var(--devdoc-success)"
      : tone === "warning"
        ? "var(--devdoc-warning)"
        : "var(--devdoc-text)";

  return (
    <p
      className="rounded-lg border p-3 text-sm leading-6"
      style={{
        backgroundColor: tone === "neutral" ? "var(--devdoc-surface-inset)" : "color-mix(in srgb, currentColor 10%, transparent)",
        borderColor: tone === "neutral" ? "var(--devdoc-border)" : "color-mix(in srgb, currentColor 32%, var(--devdoc-border))",
        color,
      }}
    >
      {children}
    </p>
  );
}

function DocumentGuidancePanel({
  section,
  writingIssues,
  linkedArtefacts,
  isLoadingLinkedArtefacts,
  linkedArtefactsError,
}) {
  if (!section) {
    return (
      <aside className="devdoc-card-border rounded-lg p-6 text-sm text-[var(--devdoc-muted)]">
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
        <TextBlock label="Placeholder">{section.placeholderText || "No placeholder provided."}</TextBlock>
      </HelperBlock>

      <HelperBlock title="Writing Helper">
        {writingIssues ? (
          <ul className="space-y-2 pl-4">
            {writingIssues.map((issue, index) => (
              <li
                key={`${issue}-${index}`}
                className={`text-sm leading-6 ${
                  issue.includes("No obvious")
                    ? "text-[var(--devdoc-success)]"
                    : "list-disc text-[var(--devdoc-warning)]"
                }`}
              >
                {issue}
              </li>
            ))}
          </ul>
        ) : (
          <ToneMessage>Run Review &gt; Writing Check to see suggestions.</ToneMessage>
        )}
      </HelperBlock>

      <HelperBlock title="Linked Artefacts">
        {isLoadingLinkedArtefacts ? (
          <p className="text-sm text-[var(--devdoc-muted)]">Loading linked artefacts...</p>
        ) : linkedArtefactsError ? (
          <p className="text-sm text-[var(--devdoc-error)]">{linkedArtefactsError}</p>
        ) : linkedArtefacts?.summary?.hasLinks ? (
          <div className="grid gap-4">
            {linkedArtefacts.requirements.length > 0 && (
              <div>
                <p className="devdoc-label mb-2">Requirements</p>
                <div className="grid gap-2">
                  {linkedArtefacts.requirements.map((req) => (
                    <div key={req.id} className="devdoc-inset flex flex-col gap-1 rounded-md p-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[var(--devdoc-text)]">{req.code}</span>
                        <Badge tone={req.status === "APPROVED" ? "emerald" : req.status === "IMPLEMENTED" ? "teal" : "slate"}>
                          {req.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-[var(--devdoc-text)]">{req.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {linkedArtefacts.useCases.length > 0 && (
              <div>
                <p className="devdoc-label mb-2">Use Cases</p>
                <div className="grid gap-2">
                  {linkedArtefacts.useCases.map((uc) => (
                    <div key={uc.id} className="devdoc-inset flex flex-col gap-1 rounded-md p-2">
                      <span className="text-xs font-bold text-[var(--devdoc-text)]">{uc.code}</span>
                      <p className="text-sm text-[var(--devdoc-text)]">{uc.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <ToneMessage>
            No linked artefacts yet. Use the Traceability Matrix to connect this section to requirements or use cases.
          </ToneMessage>
        )}
      </HelperBlock>

      <HelperBlock title="Validation Hints">
        <div className="mb-3">
          <p className="devdoc-label">{section.isRequired ? "Required" : "Optional"}</p>
          <div className="mt-2">
            <Badge tone={section.isRequired ? "amber" : "slate"}>
              {section.isRequired ? "Required" : "Optional"}
            </Badge>
          </div>
        </div>

        {section.isRequired && linkedArtefacts && !linkedArtefacts.summary.hasLinks ? (
          <ToneMessage tone="warning">This required section is not linked to any artefact yet.</ToneMessage>
        ) : null}

        {linkedArtefacts?.summary?.requirementCount > 0 ? (
          <ToneMessage tone="success">This section is connected to requirements.</ToneMessage>
        ) : null}

        {linkedArtefacts?.summary?.useCaseCount > 0 ? (
          <ToneMessage tone="success">This section is connected to use cases.</ToneMessage>
        ) : null}
      </HelperBlock>
    </aside>
  );
}

export default DocumentGuidancePanel;
