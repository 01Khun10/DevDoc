const BADGE_MAP = {
  teal:    { bg: "rgba(20,184,166,0.12)",  border: "rgba(20,184,166,0.35)",  color: "#0d9488" },
  emerald: { bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.35)",  color: "#059669" },
  amber:   { bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.35)",  color: "#b45309" },
  slate:   { bg: "var(--devdoc-surface-muted)", border: "var(--devdoc-border)", color: "var(--devdoc-muted)" },
};

function Badge({ children, tone = "slate" }) {
  const s = BADGE_MAP[tone] || BADGE_MAP.slate;
  return (
    <span
      className="rounded-md px-2.5 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: s.bg, border: `1px solid ${s.border}`, color: s.color }}
    >
      {children}
    </span>
  );
}

function SourceCard({ item, mode, isSelected, isLinked, onSelect }) {
  const isUseCase = mode.sourceType === "USE_CASE";
  return (
    <button
      className="rounded-2xl p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
      style={{
        border: `1px solid ${isSelected ? "var(--devdoc-primary)" : "var(--devdoc-border)"}`,
        backgroundColor: isSelected ? "var(--devdoc-primary-soft)" : "var(--devdoc-surface)",
        outline: isSelected ? `2px solid var(--devdoc-primary-soft)` : "none",
      }}
      type="button"
      onClick={() => onSelect(item.id)}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-bold" style={{ color: "var(--devdoc-primary)" }}>{item.code}</span>
        {!isUseCase && item.type ? <Badge tone="slate">{item.type}</Badge> : null}
        <Badge tone={isLinked ? "emerald" : "amber"}>{isLinked ? "Linked" : "Unlinked"}</Badge>
      </div>
      <h4 className="mt-3 text-sm font-semibold leading-5" style={{ color: "var(--devdoc-text)" }}>{item.title}</h4>
      {isUseCase ? (
        <p className="mt-2 line-clamp-2 text-xs leading-5" style={{ color: "var(--devdoc-muted)" }}>
          {item.description || "No description"}
        </p>
      ) : (
        <p className="mt-2 text-xs font-semibold uppercase" style={{ color: "var(--devdoc-muted)" }}>
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
      className="rounded-2xl p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
      style={{
        border: `1px solid ${isLinked ? "var(--devdoc-success)" : "var(--devdoc-border)"}`,
        backgroundColor: isLinked ? "rgba(16,185,129,0.08)" : "var(--devdoc-surface)",
      }}
      disabled={isProcessing}
      type="button"
      onClick={() => onToggle(item)}
    >
      {isRequirement ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold" style={{ color: "var(--devdoc-primary)" }}>{item.code}</span>
            {item.type ? <Badge tone="slate">{item.type}</Badge> : null}
            <Badge tone={isLinked ? "emerald" : "slate"}>
              {isProcessing ? "Working..." : isLinked ? "Linked" : "Click to link"}
            </Badge>
          </div>
          <p className="mt-3 text-sm font-semibold" style={{ color: "var(--devdoc-text)" }}>{item.title}</p>
          <p className="mt-2 text-xs font-semibold uppercase" style={{ color: "var(--devdoc-muted)" }}>
            {item.status || "PROPOSED"}
          </p>
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold" style={{ color: "var(--devdoc-text)" }}>
              {item.document?.title || "Untitled document"}
            </span>
            <Badge tone="teal">{item.document?.documentType || "DOC"}</Badge>
            <Badge tone={isLinked ? "emerald" : "slate"}>
              {isProcessing ? "Working..." : isLinked ? "Linked" : "Click to link"}
            </Badge>
          </div>
          <p className="mt-3 text-sm font-semibold" style={{ color: "var(--devdoc-text)" }}>
            Section {item.sectionNumber} - {item.title}
          </p>
          <p className="mt-2 text-xs font-semibold uppercase" style={{ color: "var(--devdoc-muted)" }}>
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
    if (!selectedSource) return null;
    return links.find((link) => link.sourceId === selectedSource.id && link.targetId === targetId) || null;
  }

  return (
    <section
      className="overflow-hidden rounded-2xl shadow-[var(--devdoc-shadow)]"
      style={{ border: "1px solid var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
    >
      <div
      className="border-b p-5"
        style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface-muted)" }}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-bold" style={{ color: "var(--devdoc-text)" }}>Build traceability links</h2>
            <p className="mt-2 text-sm leading-6" style={{ color: "var(--devdoc-muted)" }}>{mode.explanation}</p>
            <div
              className="mt-3 inline-flex rounded-md px-3 py-1 text-xs font-semibold"
              style={{ backgroundColor: "var(--devdoc-surface-inset)", border: "1px solid var(--devdoc-border)", color: "var(--devdoc-muted)" }}
            >
              Link type: {mode.linkType}
            </div>
          </div>
          <div className="grid gap-2 text-xs sm:grid-cols-3 lg:min-w-[24rem]" style={{ color: "var(--devdoc-muted)" }}>
            <div className="devdoc-inset">
              <span className="font-bold" style={{ color: "var(--devdoc-text)" }}>{sourceItems.length}</span> total
            </div>
            <div
              className="rounded-xl px-3 py-2"
              style={{ backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "var(--devdoc-success)" }}
            >
              <span className="font-bold">{linkedSourceCount}</span> linked
            </div>
            <div
              className="rounded-xl px-3 py-2"
              style={{ backgroundColor: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "var(--devdoc-warning)" }}
            >
              <span className="font-bold">{unlinkedSourceCount}</span> unlinked
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div
          className="mx-5 mt-5 rounded-xl border px-4 py-3 text-sm font-semibold"
          style={{ backgroundColor: "rgba(207,34,46,0.08)", borderColor: "rgba(207,34,46,0.3)", color: "var(--devdoc-error)" }}
        >
          {error}
        </div>
      ) : null}

      <div className="grid gap-0 lg:grid-cols-[minmax(18rem,0.9fr)_minmax(0,1.4fr)]">
        <div className="border-b p-5 lg:border-b-0 lg:border-r" style={{ borderColor: "var(--devdoc-border)" }}>
          <div className="flex items-center justify-between gap-3">
            <h3 className="devdoc-label">{mode.sourceLabel}</h3>
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
            <h3 className="devdoc-label">{mode.targetLabel}</h3>
            <Badge tone="slate">{targetItems.length} available</Badge>
          </div>

          {!selectedSource ? (
            <div
              className="mt-4 rounded-xl border border-dashed p-8 text-sm"
              style={{ borderColor: "var(--devdoc-border)", color: "var(--devdoc-muted)" }}
            >
              Select a {mode.sourceLabel.toLowerCase().replace(/s$/, "")} to see available targets.
            </div>
          ) : (
            <div className="mt-4 grid max-h-[34rem] gap-3 overflow-y-auto pr-1">
              <div
                className="rounded-xl px-4 py-3 text-sm"
                style={{ backgroundColor: "var(--devdoc-surface-inset)", border: "1px solid var(--devdoc-border)", color: "var(--devdoc-muted)" }}
              >
                Linking targets for{" "}
                <span className="font-semibold" style={{ color: "var(--devdoc-text)" }}>
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
