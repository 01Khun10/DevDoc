function formatDate(value) {
  if (!value) {
    return "Unknown";
  }

  return new Date(value).toLocaleDateString();
}

function buildMap(items) {
  return items.reduce((map, item) => {
    map[item.id] = item;
    return map;
  }, {});
}

function formatLinkLabel(linkType) {
  return linkType === "covers" ? "covers" : "described_by";
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
      label: requirement
        ? `${requirement.code} - ${requirement.title}`
        : "Requirement is no longer available",
      type: "Requirement",
      badge: requirement?.type || "REQ"
    };
  }

  return {
    label: "Source artefact is no longer available",
    type: "Source",
    badge: "SRC"
  };
}

function getTargetLabel(link, maps) {
  if (link.targetType === "REQUIREMENT") {
    const requirement = maps.requirements[link.targetId];
    return {
      label: requirement
        ? `${requirement.code} - ${requirement.title}`
        : "Requirement is no longer available",
      type: "Requirement",
      badge: requirement?.type || "REQ"
    };
  }

  if (link.targetType === "DOCUMENT_SECTION") {
    const section = maps.documentSections[link.targetId];
    return {
      label: section
        ? `${section.document?.documentType || "DOC"} - Section ${section.sectionNumber} - ${
            section.title
          }`
        : "Document section is no longer available",
      type: section?.document?.title || "Document section",
      badge: section?.document?.documentType || "DOC"
    };
  }

  return {
    label: "Target artefact is no longer available",
    type: "Target",
    badge: "TGT"
  };
}

function TraceabilityLinkList({
  links = [],
  useCases = [],
  requirements = [],
  documentSections = [],
  onDelete,
  isDeletingId,
}) {
  const maps = {
    useCases: buildMap(useCases),
    requirements: buildMap(requirements),
    documentSections: buildMap(documentSections),
  };

  if (links.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600 shadow-sm">
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
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            key={link.id}
          >
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_9rem_minmax(0,1fr)_auto] xl:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {source.type}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-700">
                    {source.badge}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-700">{source.label}</p>
              </div>

              <div className="rounded-full bg-teal-50 px-3 py-2 text-center text-xs font-bold text-teal-700 ring-1 ring-teal-100">
                {formatLinkLabel(link.linkType)}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {target.type}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                    {target.badge}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-700">{target.label}</p>
                <p className="mt-2 text-xs text-slate-500">Created {formatDate(link.createdAt)}</p>
              </div>

              <button
                className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
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
