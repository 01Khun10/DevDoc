function formatDate(value) {
  if (!value) {
    return "Unknown";
  }

  return new Date(value).toLocaleDateString();
}

function buildRequirementMap(requirements) {
  return requirements.reduce((map, requirement) => {
    map[requirement.id] = requirement;
    return map;
  }, {});
}

function buildSectionMap(documentSections) {
  return documentSections.reduce((map, section) => {
    map[section.id] = section;
    return map;
  }, {});
}

function TraceabilityLinkList({
  links,
  requirements,
  documentSections,
  onDelete,
  isDeletingId
}) {
  const requirementMap = buildRequirementMap(requirements);
  const sectionMap = buildSectionMap(documentSections);

  if (links.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600 shadow-sm">
        No traceability links yet.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {links.map((link) => {
        const requirement = requirementMap[link.sourceId];
        const section = sectionMap[link.targetId];

        return (
          <article
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            key={link.id}
          >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Requirement</p>
                <p className="mt-2 text-sm font-bold text-teal-700">
                  {requirement?.code || "Unknown requirement"}
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {requirement?.title || "Requirement is no longer available"}
                </p>
              </div>

              <div className="rounded-full bg-slate-100 px-3 py-1 text-center text-xs font-semibold text-slate-700">
                described by
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Document section</p>
                <p className="mt-2 text-sm font-bold text-slate-950">
                  {section?.document?.title || "Unknown document"}
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {section
                    ? `Section ${section.sectionNumber} - ${section.title}`
                    : "Section is no longer available"}
                </p>
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
