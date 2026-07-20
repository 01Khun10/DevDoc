import { useMemo, useState } from "react";
import { Icon } from "../components/ui";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  useTraceabilityLinks, useTraceabilityOptions, useTraceabilitySuggestions,
  useCreateTraceabilityLink, useDeleteTraceabilityLink,
} from "../api/traceability";


const MODES = {
  USE_CASE_REQUIREMENT: { label: "Use Cases → Requirements", sourceType: "USE_CASE", targetType: "REQUIREMENT", linkType: "covers", sourceKind: "useCases", targetKind: "requirements" },
  USE_CASE_DOCUMENT_SECTION: { label: "Use Cases → Sections", sourceType: "USE_CASE", targetType: "DOCUMENT_SECTION", linkType: "described_by", sourceKind: "useCases", targetKind: "documentSections" },
  REQUIREMENT_DOCUMENT_SECTION: { label: "Requirements → Sections", sourceType: "REQUIREMENT", targetType: "DOCUMENT_SECTION", linkType: "described_by", sourceKind: "requirements", targetKind: "documentSections" },
  REQUIREMENT_DESIGN_ELEMENT: { label: "Requirements → Design", sourceType: "REQUIREMENT", targetType: "DESIGN_ELEMENT", linkType: "implemented_by", sourceKind: "requirements", targetKind: "designElements" },
  REQUIREMENT_TEST_CASE: { label: "Requirements → Tests", sourceType: "REQUIREMENT", targetType: "TEST_CASE", linkType: "verified_by", sourceKind: "requirements", targetKind: "testCases" },
};
const MODE_ORDER = Object.keys(MODES);
const TYPE_COLOR = {
  USE_CASE: "var(--devdoc-artifact-uc)", REQUIREMENT: "var(--devdoc-artifact-fr)",
  DOCUMENT_SECTION: "var(--devdoc-artifact-sec)", DESIGN_ELEMENT: "var(--devdoc-artifact-de)", TEST_CASE: "var(--devdoc-artifact-tc)",
};
const TABS = [["grid", "Grid"], ["graph", "Graph"], ["map", "Map"], ["builder", "Builder"], ["suggestions", "Suggestions"]];

function itemLabel(item) { return item.code || item.title || item.sectionNumber || item.id; }

export default function TraceabilityMatrix() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const optionsQuery = useTraceabilityOptions(id);
  const linksQuery = useTraceabilityLinks(id);
  const suggestionsQuery = useTraceabilitySuggestions(id);
  const createMutation = useCreateTraceabilityLink(id);
  const deleteMutation = useDeleteTraceabilityLink(id);

  const [tab, setTab] = useState(searchParams.get("source") ? "builder" : "grid");
  const [modeKey, setModeKey] = useState(searchParams.get("mode") && MODES[searchParams.get("mode")] ? searchParams.get("mode") : "USE_CASE_REQUIREMENT");
  const [dismissed, setDismissed] = useState(new Set());

  const mode = MODES[modeKey];
  const options = optionsQuery.data || {};
  const links = linksQuery.data || [];
  const isLoading = optionsQuery.isLoading || linksQuery.isLoading;

  const sources = options[mode.sourceKind] || [];
  const targets = options[mode.targetKind] || [];
  const modeLinks = useMemo(
    () => links.filter((l) => l.sourceType === mode.sourceType && l.targetType === mode.targetType && l.linkType === mode.linkType),
    [links, mode]
  );
  const linkFor = (sId, tId) => modeLinks.find((l) => l.sourceId === sId && l.targetId === tId) || null;

  async function toggleCell(source, target) {
    const existing = linkFor(source.id, target.id);
    if (existing) await deleteMutation.mutateAsync(existing.id);
    else await createMutation.mutateAsync({ sourceType: mode.sourceType, sourceId: source.id, targetType: mode.targetType, targetId: target.id, linkType: mode.linkType });
  }

  const suggestions = (suggestionsQuery.data || []).filter((s) => !dismissed.has(`${s.sourceId}-${s.targetId}`));

  return (
    <main className="min-h-screen text-[var(--devdoc-text)]" style={{ backgroundColor: "var(--devdoc-bg)" }}>
      <div className="border-b px-6 py-5" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--devdoc-primary)]">Traceability</p>
        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-headline text-2xl font-bold tracking-tight">Traceability</h1>
            <p className="mt-1 text-sm text-[var(--devdoc-muted)]">{modeLinks.length} link{modeLinks.length === 1 ? "" : "s"} in this view</p>
          </div>
          <select value={modeKey} onChange={(e) => setModeKey(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm outline-none focus:border-[var(--devdoc-highlight)]"
            style={{ backgroundColor: "var(--devdoc-surface-inset)", borderColor: "var(--devdoc-border)", color: "var(--devdoc-text)" }}>
            {MODE_ORDER.map((k) => <option key={k} value={k}>{MODES[k].label}</option>)}
          </select>
        </div>
        {/* tabs */}
        <div className="mt-4 flex gap-1">
          {TABS.map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className="relative rounded-t px-3 py-2 text-sm font-medium transition-colors"
              style={tab === key ? { color: "var(--devdoc-primary)" } : { color: "var(--devdoc-muted)" }}>
              {label}
              {key === "suggestions" && suggestions.length > 0 && (
                <span className="ml-1.5 rounded-full px-1.5 text-[10px]" style={{ backgroundColor: "var(--devdoc-primary)", color: "#fff" }}>{suggestions.length}</span>
              )}
              {tab === key && <span className="absolute inset-x-0 bottom-0 h-0.5" style={{ backgroundColor: "var(--devdoc-primary)" }} />}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-6">
        {isLoading ? (
          <div className="rounded-lg border p-10 text-center" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
            <p className="font-mono text-sm text-[var(--devdoc-muted)]">Loading traceability…</p>
          </div>
        ) : sources.length === 0 || targets.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border px-6 py-16 text-center"
            style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)", backgroundImage: "linear-gradient(var(--devdoc-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--devdoc-grid-line) 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
            <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--devdoc-muted)]">Nothing to link yet</p>
            <h3 className="font-headline text-xl font-semibold">Add artifacts, then link them here</h3>
            <p className="mt-2 max-w-sm text-sm text-[var(--devdoc-muted)]">This view needs both {mode.sourceType.replace("_", " ").toLowerCase()}s and {mode.targetType.replace("_", " ").toLowerCase()}s.</p>
          </div>
        ) : (
          <>
            {tab === "grid" && <GridView sources={sources} targets={targets} linkFor={linkFor} onToggle={toggleCell} mode={mode} />}
            {tab === "graph" && <GraphView sources={sources} targets={targets} modeLinks={modeLinks} mode={mode} />}
            {tab === "map" && <MapView sources={sources} targets={targets} modeLinks={modeLinks} mode={mode} linkFor={linkFor} />}
            {tab === "builder" && <BuilderView sources={sources} targets={targets} linkFor={linkFor} onToggle={toggleCell} modeLinks={modeLinks} mode={mode} onDelete={(l) => deleteMutation.mutateAsync(l.id)} />}
            {tab === "suggestions" && <SuggestionsView suggestions={suggestions} loading={suggestionsQuery.isLoading}
              onAccept={async (s) => { await createMutation.mutateAsync({ sourceType: s.sourceType, sourceId: s.sourceId, targetType: s.targetType, targetId: s.targetId, linkType: s.linkType }); setDismissed((d) => new Set(d).add(`${s.sourceId}-${s.targetId}`)); }}
              onDismiss={(s) => setDismissed((d) => new Set(d).add(`${s.sourceId}-${s.targetId}`))} />}
          </>
        )}
      </div>
    </main>
  );
}

/* ---------- GRID ---------- */
function GridView({ sources, targets, linkFor, onToggle, mode }) {
  return (
    <div className="overflow-auto rounded-lg border" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
      <table className="border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 border-b border-r px-3 py-2 text-left" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface-inset)" }} />
            {targets.map((t) => (
              <th key={t.id} className="border-b border-r px-2 py-2 text-center align-bottom" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface-inset)" }}>
                <span className="font-mono text-[11px]" style={{ color: TYPE_COLOR[mode.targetType] }}>{itemLabel(t)}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sources.map((s) => (
            <tr key={s.id}>
              <th className="sticky left-0 z-10 border-b border-r px-3 py-2 text-left" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
                <span className="font-mono text-[11px]" style={{ color: TYPE_COLOR[mode.sourceType] }}>{itemLabel(s)}</span>
              </th>
              {targets.map((t) => {
                const linked = !!linkFor(s.id, t.id);
                return (
                  <td key={t.id} className="border-b border-r p-0 text-center" style={{ borderColor: "var(--devdoc-border)" }}>
                    <button onClick={() => onToggle(s, t)} className="flex h-9 w-9 items-center justify-center transition-colors hover:bg-[var(--devdoc-surface-inset)]"
                      style={{ color: linked ? "var(--devdoc-primary)" : "var(--devdoc-subtle)" }} title={linked ? "Linked — click to remove" : "Click to link"}>
                      {linked ? <Icon size={16}><path d="M20 6 9 17l-5-5" /></Icon> : <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--devdoc-border-strong)" }} />}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- GRAPH ---------- */
function GraphView({ sources, targets, modeLinks, mode }) {
  const W = 720, rowH = 44, pad = 30;
  const H = Math.max(sources.length, targets.length) * rowH + pad * 2;
  const sx = 150, tx = W - 150;
  const sy = (i) => pad + i * rowH + rowH / 2;
  const ty = (i) => pad + i * rowH + rowH / 2;
  const tIndex = Object.fromEntries(targets.map((t, i) => [t.id, i]));
  const sIndex = Object.fromEntries(sources.map((s, i) => [s.id, i]));

  return (
    <div className="overflow-auto rounded-lg border p-4" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)", backgroundImage: "linear-gradient(var(--devdoc-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--devdoc-grid-line) 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 640 }}>
        {modeLinks.map((l, i) => {
          const si = sIndex[l.sourceId], ti = tIndex[l.targetId];
          if (si == null || ti == null) return null;
          const x1 = sx + 60, y1 = sy(si), x2 = tx - 60, y2 = ty(ti), mx = (x1 + x2) / 2;
          return <path key={i} d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`} fill="none" stroke="var(--devdoc-highlight)" strokeWidth="1" opacity="0.6" />;
        })}
        {sources.map((s, i) => (
          <g key={s.id}>
            <rect x={sx - 60} y={sy(i) - 14} width="120" height="28" rx="6" fill={`color-mix(in srgb, ${TYPE_COLOR[mode.sourceType]} 12%, transparent)`} stroke={TYPE_COLOR[mode.sourceType]} strokeWidth="1" />
            <text x={sx} y={sy(i) + 4} textAnchor="middle" fontFamily="ui-monospace,monospace" fontSize="11" fill={TYPE_COLOR[mode.sourceType]}>{itemLabel(s)}</text>
          </g>
        ))}
        {targets.map((t, i) => (
          <g key={t.id}>
            <rect x={tx - 60} y={ty(i) - 14} width="120" height="28" rx="6" fill={`color-mix(in srgb, ${TYPE_COLOR[mode.targetType]} 12%, transparent)`} stroke={TYPE_COLOR[mode.targetType]} strokeWidth="1" />
            <text x={tx} y={ty(i) + 4} textAnchor="middle" fontFamily="ui-monospace,monospace" fontSize="11" fill={TYPE_COLOR[mode.targetType]}>{itemLabel(t)}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ---------- MAP (floor-plan) ---------- */
function MapView({ sources, targets, modeLinks, mode, linkFor }) {
  const linkedS = new Set(modeLinks.map((l) => l.sourceId));
  const linkedT = new Set(modeLinks.map((l) => l.targetId));
  const cell = (item, type, orphan) => (
    <div key={item.id} className="relative rounded border p-3" style={{ borderColor: "var(--devdoc-border-strong)", backgroundColor: `color-mix(in srgb, ${TYPE_COLOR[type]} 6%, transparent)` }}>
      {orphan && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--devdoc-error)" }} title="orphan" />}
      <p className="font-mono text-[11px]" style={{ color: TYPE_COLOR[type] }}>{itemLabel(item)}</p>
      <p className="truncate text-[11px] text-[var(--devdoc-muted)]">{item.title || item.description || ""}</p>
    </div>
  );
  return (
    <div className="rounded-lg border p-5" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)", backgroundImage: "linear-gradient(var(--devdoc-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--devdoc-grid-line) 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
      <div className="mb-4 flex items-center justify-between">
        <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--devdoc-muted)]">Project floor plan</p>
        <span className="rounded border px-2 py-1 font-mono text-[10px] text-[var(--devdoc-muted)]" style={{ borderColor: "var(--devdoc-border)" }}>
          {sources.length + targets.length} artifacts · {modeLinks.length} links
        </span>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-wide" style={{ color: TYPE_COLOR[mode.sourceType] }}>{mode.sourceType.replace("_", " ")}</p>
          <div className="grid grid-cols-2 gap-2">{sources.map((s) => cell(s, mode.sourceType, !linkedS.has(s.id)))}</div>
        </div>
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-wide" style={{ color: TYPE_COLOR[mode.targetType] }}>{mode.targetType.replace("_", " ")}</p>
          <div className="grid grid-cols-2 gap-2">{targets.map((t) => cell(t, mode.targetType, !linkedT.has(t.id)))}</div>
        </div>
      </div>
      <p className="mt-4 font-mono text-[10px] text-[var(--devdoc-subtle)]">Red corner tick = orphan (no links in this view)</p>
    </div>
  );
}

/* ---------- BUILDER ---------- */
function BuilderView({ sources, targets, linkFor, onToggle, modeLinks, mode, onDelete }) {
  const [sel, setSel] = useState(null);
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]">
      <div className="rounded-lg border" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
        <p className="border-b px-4 py-2 font-mono text-[11px] uppercase tracking-wide" style={{ borderColor: "var(--devdoc-border)", color: TYPE_COLOR[mode.sourceType] }}>Source · {mode.sourceType.replace("_", " ")}</p>
        <div className="max-h-[420px] overflow-y-auto">
          {sources.map((s) => (
            <button key={s.id} onClick={() => setSel(s)} className="flex w-full items-center gap-2 border-t px-4 py-2.5 text-left text-sm transition-colors first:border-t-0 hover:bg-[var(--devdoc-surface-inset)]"
              style={{ borderColor: "var(--devdoc-border)", backgroundColor: sel?.id === s.id ? "var(--devdoc-primary-soft)" : undefined }}>
              <span className="font-mono text-[11px]" style={{ color: TYPE_COLOR[mode.sourceType] }}>{itemLabel(s)}</span>
              <span className="truncate text-[var(--devdoc-muted)]">{s.title || ""}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-lg border" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
        <p className="border-b px-4 py-2 font-mono text-[11px] uppercase tracking-wide" style={{ borderColor: "var(--devdoc-border)", color: TYPE_COLOR[mode.targetType] }}>
          {sel ? `Link ${itemLabel(sel)} to…` : "Select a source"}
        </p>
        <div className="max-h-[420px] overflow-y-auto">
          {sel ? targets.map((t) => {
            const linked = !!linkFor(sel.id, t.id);
            return (
              <button key={t.id} onClick={() => onToggle(sel, t)} className="flex w-full items-center gap-2 border-t px-4 py-2.5 text-left text-sm transition-colors first:border-t-0 hover:bg-[var(--devdoc-surface-inset)]" style={{ borderColor: "var(--devdoc-border)" }}>
                <span className="flex h-5 w-5 items-center justify-center rounded border" style={{ borderColor: linked ? "var(--devdoc-primary)" : "var(--devdoc-border)", color: "var(--devdoc-primary)" }}>
                  {linked && <Icon size={13}><path d="M20 6 9 17l-5-5" /></Icon>}
                </span>
                <span className="font-mono text-[11px]" style={{ color: TYPE_COLOR[mode.targetType] }}>{itemLabel(t)}</span>
                <span className="truncate text-[var(--devdoc-muted)]">{t.title || ""}</span>
              </button>
            );
          }) : <p className="px-4 py-10 text-center text-sm text-[var(--devdoc-muted)]">Pick a source on the left to start linking.</p>}
        </div>
      </div>
    </div>
  );
}

/* ---------- SUGGESTIONS ---------- */
function SuggestionsView({ suggestions, loading, onAccept, onDismiss }) {
  if (loading) return <p className="py-10 text-center font-mono text-sm text-[var(--devdoc-muted)]">Computing suggestions…</p>;
  if (!suggestions.length) return (
    <div className="rounded-lg border px-6 py-14 text-center" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--devdoc-muted)]">No suggestions</p>
      <p className="mt-2 text-sm text-[var(--devdoc-muted)]">Nothing to suggest right now — every strong match is already linked.</p>
    </div>
  );
  return (
    <div className="flex flex-col gap-3">
      {suggestions.map((s, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg border p-4" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
          <div className="flex flex-1 items-center gap-3">
            <span className="font-mono text-[12px]" style={{ color: TYPE_COLOR[s.sourceType] }}>{s.sourceCode || s.sourceId}</span>
            <Icon size={14}><path d="M5 12h14M12 5l7 7-7 7" /></Icon>
            <span className="font-mono text-[12px]" style={{ color: TYPE_COLOR[s.targetType] }}>{s.targetCode || s.targetId}</span>
            {s.score != null && <span className="rounded px-2 py-0.5 font-mono text-[10px] text-[var(--devdoc-muted)]" style={{ backgroundColor: "var(--devdoc-surface-inset)" }}>{Math.round(s.score * 100)}% match</span>}
            {s.reasonTerms?.length > 0 && <span className="text-[11px] text-[var(--devdoc-muted)]">shared: {s.reasonTerms.slice(0, 3).join(", ")}</span>}
          </div>
          <button onClick={() => onAccept(s)} className="rounded-md px-3 py-1.5 text-sm font-medium text-white" style={{ backgroundColor: "var(--devdoc-primary)" }}>Accept</button>
          <button onClick={() => onDismiss(s)} className="rounded-md border px-3 py-1.5 text-sm text-[var(--devdoc-muted)]" style={{ borderColor: "var(--devdoc-border)" }}>Dismiss</button>
        </div>
      ))}
    </div>
  );
}
