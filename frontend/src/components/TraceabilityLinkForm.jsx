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

function SourceCard({ item, mode, isSelected, isLinked, onSelect }) {
  const isUseCase = mode.sourceType === "USE_CASE";

  return (
    <button
      className={`rounded-xl border p-4 text-left transition ${
        isSelected
          ? "border-teal-500 bg-teal-50 shadow-sm ring-2 ring-teal-100"
          : "border-slate-200 bg-white hover:border-teal-200 hover:bg-slate-50"
      }`}
      type="button"
      onClick={() => onSelect(item.id)}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-bold text-teal-700">{item.code}</span>
        {!isUseCase && item.type ? <Badge tone="slate">{item.type}</Badge> : null}
        <Badge tone={isLinked ? "emerald" : "amber"}>
          {isLinked ? "Linked" : "Unlinked"}
        </Badge>
      </div>
      <h4 className="mt-3 text-sm font-semibold leading-5 text-slate-950">{item.title}</h4>
      {isUseCase ? (
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">
          {item.description || "No description"}
        </p>
      ) : (
        <p className="mt-2 text-xs font-semibold uppercase text-slate-500">
          {item.status || "PROPOSED"}
        </p>
      )}
    </button>
  );
}

function TargetCard({ item, mode, isLinked, isProcessing, onToggle }) {
  const isRequirement = mode.targetType === "REQUIREMENT";

  return (
    <button
      className={`rounded-xl border p-4 text-left transition disabled:cursor-wait disabled:opacity-70 ${
        isLinked
          ? "border-emerald-400 bg-emerald-50 shadow-sm ring-2 ring-emerald-100"
          : "border-slate-200 bg-white hover:border-teal-200 hover:bg-slate-50"
      }`}
      disabled={isProcessing}
      type="button"
      onClick={() => onToggle(item)}
    >
      {isRequirement ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-teal-700">{item.code}</span>
            {item.type ? <Badge tone="slate">{item.type}</Badge> : null}
            <Badge tone={isLinked ? "emerald" : "slate"}>
              {isProcessing ? "Working..." : isLinked ? "Linked" : "Click to link"}
            </Badge>
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-950">{item.title}</p>
          <p className="mt-2 text-xs font-semibold uppercase text-slate-500">
            {item.status || "PROPOSED"}
          </p>
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-slate-950">
              {item.document?.title || "Untitled document"}
            </span>
            <Badge tone="teal">{item.document?.documentType || "DOC"}</Badge>
            <Badge tone={isLinked ? "emerald" : "slate"}>
              {isProcessing ? "Working..." : isLinked ? "Linked" : "Click to link"}
            </Badge>
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-950">
            Section {item.sectionNumber} - {item.title}
          </p>
          <p className="mt-2 text-xs font-semibold uppercase text-slate-500">
            {item.status || "EMPTY"}
          </p>
        </>
      )}
    </button>
  );
}

function TraceabilityLinkForm({
  sourceItems = [],
  targetItems = [],
  links = [],
  mode,
  selectedSourceId,
  onSelectSource,
  onToggleLink,
  processingTargetId,
  error,
}) {
  const selectedSource = sourceItems.find((item) => item.id === selectedSourceId) || null;
  const linkedSourceIds = new Set(links.map((link) => link.sourceId));
  const linkedSourceCount = sourceItems.filter((item) => linkedSourceIds.has(item.id)).length;
  const unlinkedSourceCount = sourceItems.length - linkedSourceCount;

  function getLinkForTarget(targetId) {
    if (!selectedSource) {
      return null;
    }

    return (
      links.find((link) => link.sourceId === selectedSource.id && link.targetId === targetId) ||
      null
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Build traceability links</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{mode.explanation}</p>
            <div className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              Link type: {mode.linkType}
            </div>
          </div>
          <div className="grid gap-2 text-xs text-slate-600 sm:grid-cols-3 lg:min-w-[24rem]">
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <span className="font-bold text-slate-950">{sourceItems.length}</span> total
            </div>
            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700">
              <span className="font-bold">{linkedSourceCount}</span> linked
            </div>
            <div className="rounded-lg bg-amber-50 px-3 py-2 text-amber-700">
              <span className="font-bold">{unlinkedSourceCount}</span> unlinked
            </div>
          </div>
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
              {mode.sourceLabel}
            </h3>
            <Badge tone="slate">{sourceItems.length} total</Badge>
          </div>

          <div className="mt-4 grid max-h-[34rem] gap-3 overflow-y-auto pr-1">
            {sourceItems.map((item) => (
              <SourceCard
                key={item.id}
                item={item}
                mode={mode}
                isSelected={item.id === selectedSourceId}
                isLinked={linkedSourceIds.has(item.id)}
                onSelect={onSelectSource}
              />
            ))}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">
              {mode.targetLabel}
            </h3>
            <Badge tone="slate">{targetItems.length} available</Badge>
          </div>

          {!selectedSource ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-600">
              Select a {mode.sourceLabel.toLowerCase().replace(/s$/, "")} to see available
              targets.
            </div>
          ) : (
            <div className="mt-4 grid max-h-[34rem] gap-3 overflow-y-auto pr-1">
              <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
                Linking targets for{" "}
                <span className="font-semibold text-slate-950">
                  {selectedSource.code} - {selectedSource.title}
                </span>
              </div>

              {targetItems.map((item) => {
                const existingLink = getLinkForTarget(item.id);
                const isLinked = Boolean(existingLink);
                const isProcessing = processingTargetId === item.id;

                return (
                  <TargetCard
                    key={item.id}
                    item={item}
                    mode={mode}
                    isLinked={isLinked}
                    isProcessing={isProcessing}
                    onToggle={onToggleLink}
                  />
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
