function formatDate(value) {
  if (!value) return "Unknown";
  return new Date(value).toLocaleDateString();
}

function buildMap(items) {
  return items.reduce((map, item) => {
    map[item.id] = item;
    return map;
  }, {});
}

function formatLinkLabel(linkType) {
  return linkType;
}

function getSourceLabel(link, maps) {
  if (link.sourceType === "USE_CASE") {
    const useCase = maps.useCases[link.sourceId];
    return {
      label: useCase ? `${useCase.code} - ${useCase.title}` : "Use case is no longer available",
      type: "Use case",
      badge: useCase?.code || "UC"
    };
  }
  if (link.sourceType === "REQUIREMENT") {
    const requirement = maps.requirements[link.sourceId];
    return {
      label: requirement ? `${requirement.code} - ${requirement.title}` : "Requirement is no longer available",
      type: "Requirement",
      badge: requirement?.type || "REQ"
    };
  }
  return { label: "Source artefact is no longer available", type: "Source", badge: "SRC" };
}

function getTargetLabel(link, maps) {
  if (link.targetType === "REQUIREMENT") {
    const requirement = maps.requirements[link.targetId];
    return {
      label: requirement ? `${requirement.code} - ${requirement.title}` : "Requirement is no longer available",
      type: "Requirement",
      badge: requirement?.type || "REQ"
    };
  }
  if (link.targetType === "DOCUMENT_SECTION") {
    const section = maps.documentSections[link.targetId];
    return {
      label: section
        ? `${section.document?.documentType || "DOC"} - Section ${section.sectionNumber} - ${section.title}`
        : "Document section is no longer available",
      type: section?.document?.title || "Document section",
      badge: section?.document?.documentType || "DOC"
    };
  }
  if (link.targetType === "DESIGN_ELEMENT") {
    const designElement = maps.designElements[link.targetId];
    return {
      label: designElement
        ? `${designElement.code} - ${designElement.title}`
        : "Design element is no longer available",
      type: "Design element",
      badge: designElement?.code || "DE"
    };
  }
  if (link.targetType === "TEST_CASE") {
    const testCase = maps.testCases[link.targetId];
    return {
      label: testCase ? `${testCase.code} - ${testCase.title}` : "Test case is no longer available",
      type: "Test case",
      badge: testCase?.code || "TC"
    };
  }
  return { label: "Target artefact is no longer available", type: "Target", badge: "TGT" };
}

function TraceabilityLinkList({
  links = [],
  useCases = [],
  requirements = [],
  documentSections = [],
  designElements = [],
  testCases = [],
  onDelete,
  isDeletingId,
}) {
  const maps = {
    useCases: buildMap(useCases),
    requirements: buildMap(requirements),
    documentSections: buildMap(documentSections),
    designElements: buildMap(designElements),
    testCases: buildMap(testCases),
  };

  if (links.length === 0) {
    return (
      <div
        className="rounded-2xl border border-dashed p-8 text-sm"
        style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)", color: "var(--devdoc-muted)" }}
      >
        No traceability links yet.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {links.map((link) => {
        const source = getSourceLabel(link, maps);
        const target = getTargetLabel(link, maps);

        return (
          <article
            className="rounded-2xl p-5 shadow-[var(--devdoc-shadow-soft)]"
            key={link.id}
            style={{ border: "1px solid var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
          >
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_9rem_minmax(0,1fr)_auto] xl:items-center">
              <div>
                <p className="devdoc-label">{source.type}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-bold"
                    style={{ backgroundColor: "var(--devdoc-primary-soft)", color: "var(--devdoc-primary)" }}
                  >
                    {source.badge}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6" style={{ color: "var(--devdoc-text)" }}>{source.label}</p>
              </div>

              <div
                className="rounded-full px-3 py-2 text-center text-xs font-bold"
                style={{
                  backgroundColor: "var(--devdoc-surface-inset)",
                  border: "1px solid var(--devdoc-border)",
                  color: "var(--devdoc-primary)",
                }}
              >
                {formatLinkLabel(link.linkType)}
              </div>

              <div>
                <p className="devdoc-label">{target.type}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-bold"
                    style={{ backgroundColor: "var(--devdoc-surface-muted)", border: "1px solid var(--devdoc-border)", color: "var(--devdoc-muted)" }}
                  >
                    {target.badge}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6" style={{ color: "var(--devdoc-text)" }}>{target.label}</p>
                <p className="mt-2 text-xs" style={{ color: "var(--devdoc-muted)" }}>Created {formatDate(link.createdAt)}</p>
              </div>

              <button
                className="rounded-lg px-4 py-2 text-sm font-bold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                style={{
                  border: "1px solid color-mix(in srgb, var(--devdoc-error) 35%, var(--devdoc-border))",
                  backgroundColor: "var(--devdoc-error-soft)",
                  color: "var(--devdoc-error)",
                }}
                disabled={isDeletingId === link.id}
                type="button"
                onClick={() => onDelete(link.id)}
              >
                {isDeletingId === link.id ? "Removing..." : "Remove"}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default TraceabilityLinkList;
