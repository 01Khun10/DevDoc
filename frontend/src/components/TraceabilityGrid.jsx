function itemLabel(item) {
  if (item.code) return item.code;
  if (item.sectionNumber) return `${item.document?.documentType || "DOC"} ${item.sectionNumber}`;
  return item.title || item.id;
}

function itemTitle(item) {
  return item.title ? `${itemLabel(item)} — ${item.title}` : itemLabel(item);
}

// Matrix grid: rows = sources, columns = targets for the active mode.
// Cell click toggles the link (optimistic via the mutations upstream).
function TraceabilityGrid({ sourceItems, targetItems, links, processingTargetId, onToggleCell }) {
  const linkedPairs = new Set(links.map((link) => `${link.sourceId}:${link.targetId}`));
  const linkedSources = new Set(links.map((link) => link.sourceId));
  const linkedTargets = new Set(links.map((link) => link.targetId));

  return (
    <div
      className="overflow-x-auto rounded-xl border"
      style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
    >
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th
              className="sticky left-0 border-b border-r p-3 text-left text-xs font-bold"
              style={{
                borderColor: "var(--devdoc-border)",
                backgroundColor: "var(--devdoc-surface-muted)",
                color: "var(--devdoc-muted)",
              }}
            >
              Source \ Target
            </th>
            {targetItems.map((target) => (
              <th
                key={target.id}
                className="border-b p-2 text-center align-bottom text-xs font-bold"
                style={{
                  borderColor: "var(--devdoc-border)",
                  backgroundColor: linkedTargets.has(target.id)
                    ? "var(--devdoc-surface-muted)"
                    : "var(--devdoc-warning-soft)",
                  color: linkedTargets.has(target.id)
                    ? "var(--devdoc-text-secondary)"
                    : "var(--devdoc-warning)",
                }}
                title={
                  linkedTargets.has(target.id)
                    ? itemTitle(target)
                    : `${itemTitle(target)} (no links in this view)`
                }
              >
                {itemLabel(target)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sourceItems.map((source) => {
            const sourceUnlinked = !linkedSources.has(source.id);
            return (
              <tr key={source.id}>
                <th
                  className="sticky left-0 border-b border-r p-3 text-left text-xs font-bold"
                  style={{
                    borderColor: "var(--devdoc-border)",
                    backgroundColor: sourceUnlinked
                      ? "var(--devdoc-warning-soft)"
                      : "var(--devdoc-surface-muted)",
                    color: sourceUnlinked ? "var(--devdoc-warning)" : "var(--devdoc-text-secondary)",
                  }}
                  title={sourceUnlinked ? `${itemTitle(source)} (no links in this view)` : itemTitle(source)}
                >
                  {itemLabel(source)}
                </th>
                {targetItems.map((target) => {
                  const isLinked = linkedPairs.has(`${source.id}:${target.id}`);
                  const isProcessing = processingTargetId === `${source.id}:${target.id}`;
                  return (
                    <td
                      key={target.id}
                      className="border-b p-1 text-center"
                      style={{ borderColor: "var(--devdoc-border)" }}
                    >
                      <button
                        type="button"
                        className="h-8 w-8 rounded-lg text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--devdoc-primary)] disabled:cursor-wait disabled:opacity-50"
                        style={{
                          backgroundColor: isLinked ? "var(--devdoc-primary)" : "var(--devdoc-surface-muted)",
                          border: `1px solid ${isLinked ? "var(--devdoc-primary)" : "var(--devdoc-border)"}`,
                          color: isLinked ? "#ffffff" : "var(--devdoc-subtle)",
                        }}
                        disabled={isProcessing}
                        aria-pressed={isLinked}
                        aria-label={`${isLinked ? "Unlink" : "Link"} ${itemLabel(source)} to ${itemLabel(target)}`}
                        title={`${itemTitle(source)} → ${itemTitle(target)}`}
                        onClick={() => onToggleCell(source, target)}
                      >
                        {isLinked ? "✓" : "·"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TraceabilityGrid;
