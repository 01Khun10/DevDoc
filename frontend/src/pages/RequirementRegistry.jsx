import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "../components/ui";
import { useParams, useSearchParams } from "react-router-dom";
import { useRequirements, useCreateRequirement, useUpdateRequirement } from "../api/requirements";
import CreateRequirementForm from "../components/CreateRequirementForm";


const STATUSES = ["PROPOSED", "APPROVED", "IMPLEMENTED", "VERIFIED"];
const PRIORITIES = ["HIGH", "MEDIUM", "LOW"];
const STATUS_COLOR = {
  PROPOSED: "var(--devdoc-muted)", APPROVED: "var(--devdoc-primary)",
  IMPLEMENTED: "var(--devdoc-highlight)", VERIFIED: "var(--devdoc-success)",
};
const PRIORITY_COLOR = { HIGH: "var(--devdoc-error)", MEDIUM: "var(--devdoc-warning)", LOW: "var(--devdoc-muted)" };

function InlineSelect({ value, options, colorMap, onChange, pending }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    if (open) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  const color = colorMap[value] || "var(--devdoc-muted)";
  return (
    <div ref={ref} className="relative">
      <button onClick={(e) => { e.preventDefault(); setOpen((o) => !o); }} disabled={pending}
        className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition-colors disabled:opacity-60"
        style={{ color, backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)` }}>
        {pending ? "…" : (value || "—").toLowerCase()}
        <Icon size={11}><path d="M6 9l6 6 6-6" /></Icon>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 min-w-[130px] overflow-hidden rounded-md border py-1 shadow-lg"
          style={{ backgroundColor: "var(--devdoc-surface-2)", borderColor: "var(--devdoc-border)" }}>
          {options.map((opt) => (
            <button key={opt} onClick={(e) => { e.preventDefault(); onChange(opt); setOpen(false); }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] transition-colors hover:bg-[var(--devdoc-surface-inset)]">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: colorMap[opt] }} />
              <span className="capitalize">{opt.toLowerCase()}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ req, highlight, onUpdate, pendingField }) {
  const ref = useRef(null);
  useEffect(() => {
    if (highlight && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
      ref.current.style.outline = "2px solid var(--devdoc-primary)";
      ref.current.style.outlineOffset = "3px";
      const t = setTimeout(() => { if (ref.current) { ref.current.style.outline = ""; ref.current.style.outlineOffset = ""; } }, 2500);
      return () => clearTimeout(t);
    }
  }, [highlight]);

  const isFR = req.type === "FR";
  const codeColor = isFR ? "var(--devdoc-artifact-fr)" : "var(--devdoc-artifact-nfr)";
  const links = req.traceabilityLinks?.length ?? req._count?.traceabilityLinks ?? 0;

  return (
    <div ref={ref} className="flex items-center gap-3 border-t px-4 py-3 transition-colors first:border-t-0 hover:bg-[var(--devdoc-surface-inset)]"
      style={{ borderColor: "var(--devdoc-border)" }}>
      <span className="font-mono text-[12px] font-medium" style={{ color: codeColor }}>{req.code}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">{req.title}</p>
        {req.description && <p className="truncate text-[12px] text-[var(--devdoc-muted)]">{req.description}</p>}
      </div>
      <InlineSelect value={req.status} options={STATUSES} colorMap={STATUS_COLOR}
        pending={pendingField === "status"} onChange={(v) => onUpdate({ status: v })} />
      <InlineSelect value={req.priority} options={PRIORITIES} colorMap={PRIORITY_COLOR}
        pending={pendingField === "priority"} onChange={(v) => onUpdate({ priority: v })} />
      {links > 0 ? (
        <span className="rounded px-2 py-0.5 font-mono text-[11px] text-[var(--devdoc-muted)]"
          style={{ backgroundColor: "var(--devdoc-surface-inset)" }}>{links} link{links === 1 ? "" : "s"}</span>
      ) : (
        <span className="rounded px-2 py-0.5 font-mono text-[11px]"
          style={{ color: "var(--devdoc-error)", backgroundColor: "var(--devdoc-error-soft)" }}>orphan</span>
      )}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 border-t px-4 py-3" style={{ borderColor: "var(--devdoc-border)" }}>
      <div className="devdoc-skeleton h-4 w-14 rounded" />
      <div className="flex-1"><div className="devdoc-skeleton h-4 w-1/2 rounded" /></div>
      <div className="devdoc-skeleton h-5 w-16 rounded" />
      <div className="devdoc-skeleton h-5 w-14 rounded" />
    </div>
  );
}

export default function RequirementRegistry() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight");

  const { data: requirements = [], isLoading, error, refetch } = useRequirements(id);
  const createMutation = useCreateRequirement(id);
  const updateMutation = useUpdateRequirement(id);

  const [filter, setFilter] = useState("ALL");
  const [sort, setSort] = useState("newest");
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [pending, setPending] = useState({}); // { [reqId]: fieldName }

  const counts = useMemo(() => ({
    all: requirements.length,
    fr: requirements.filter((r) => r.type === "FR").length,
    nfr: requirements.filter((r) => r.type === "NFR").length,
  }), [requirements]);

  const shown = useMemo(() => {
    let list = [...requirements];
    if (filter === "FR") list = list.filter((r) => r.type === "FR");
    if (filter === "NFR") list = list.filter((r) => r.type === "NFR");
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((r) => `${r.code} ${r.title} ${r.description || ""}`.toLowerCase().includes(q));
    if (sort === "code") list.sort((a, b) => (a.code || "").localeCompare(b.code || ""));
    else if (sort === "priority") {
      const rank = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      list.sort((a, b) => (rank[a.priority] ?? 3) - (rank[b.priority] ?? 3));
    } else if (sort === "oldest") list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    else list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return list;
  }, [requirements, filter, sort, query]);

  async function updateField(reqId, patch) {
    const field = Object.keys(patch)[0];
    setPending((p) => ({ ...p, [reqId]: field }));
    try {
      await updateMutation.mutateAsync({ requirementId: reqId, ...patch });
    } finally {
      setPending((p) => { const n = { ...p }; delete n[reqId]; return n; });
    }
  }

  const TABS = [["ALL", `All ${counts.all}`], ["FR", `FR ${counts.fr}`], ["NFR", `NFR ${counts.nfr}`]];

  return (
    <main className="min-h-screen text-[var(--devdoc-text)]" style={{ backgroundColor: "var(--devdoc-bg)" }}>
      <div className="border-b px-6 py-5" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--devdoc-primary)]">Requirements</p>
        <div className="mt-1.5 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-headline text-2xl font-bold tracking-tight">Requirements</h1>
            <p className="mt-1 text-sm text-[var(--devdoc-muted)]">
              {counts.all} requirement{counts.all === 1 ? "" : "s"} · {counts.fr} FR · {counts.nfr} NFR
            </p>
          </div>
          <button onClick={() => setCreateOpen(true)}
            className="flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white"
            style={{ backgroundColor: "var(--devdoc-primary)" }}>
            <Icon><path d="M12 5v14M5 12h14" /></Icon> Add requirement
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-6">
        {/* filter bar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex rounded-md border p-0.5" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface-inset)" }}>
            {TABS.map(([key, label]) => (
              <button key={key} onClick={() => setFilter(key)}
                className="rounded px-3 py-1.5 text-[13px] font-medium transition-colors"
                style={filter === key
                  ? { backgroundColor: "var(--devdoc-surface)", color: "var(--devdoc-text)", boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }
                  : { color: "var(--devdoc-muted)" }}>
                {label}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--devdoc-muted)]">
              <Icon><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></Icon>
            </span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search requirements…"
              className="w-full rounded-md border py-2 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-[var(--devdoc-subtle)] focus:border-[var(--devdoc-highlight)]"
              style={{ backgroundColor: "var(--devdoc-surface-inset)", borderColor: "var(--devdoc-border)", color: "var(--devdoc-text)" }} />
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm outline-none focus:border-[var(--devdoc-highlight)]"
            style={{ backgroundColor: "var(--devdoc-surface-inset)", borderColor: "var(--devdoc-border)", color: "var(--devdoc-text)" }}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="code">Code A–Z</option>
            <option value="priority">Priority</option>
          </select>
        </div>

        {/* list */}
        <div className="overflow-hidden rounded-lg border" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
          {error ? (
            <div className="p-8 text-center">
              <p className="text-sm text-[var(--devdoc-muted)]">Could not load requirements.</p>
              <button onClick={() => refetch()} className="mt-3 rounded-md border px-4 py-2 text-sm" style={{ borderColor: "var(--devdoc-border)" }}>Retry</button>
            </div>
          ) : isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
          ) : shown.length === 0 && counts.all === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center"
              style={{
                backgroundImage: "linear-gradient(var(--devdoc-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--devdoc-grid-line) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}>
              <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--devdoc-muted)]">No requirements yet</p>
              <h3 className="font-headline text-xl font-semibold">Capture what the system must do</h3>
              <p className="mt-2 max-w-sm text-sm text-[var(--devdoc-muted)]">
                Use cases help you discover requirements — or add FRs and NFRs directly.
              </p>
              <button onClick={() => setCreateOpen(true)} className="mt-5 flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white" style={{ backgroundColor: "var(--devdoc-primary)" }}>
                <Icon><path d="M12 5v14M5 12h14" /></Icon> Add requirement
              </button>
            </div>
          ) : shown.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-[var(--devdoc-muted)]">No requirements match your filters.</p>
          ) : (
            shown.map((req) => (
              <Row key={req.id} req={req} highlight={req.id === highlightId}
                pendingField={pending[req.id]} onUpdate={(patch) => updateField(req.id, patch)} />
            ))
          )}
        </div>
      </div>

      {createOpen && (
        <CreateRequirementForm
          onClose={() => setCreateOpen(false)}
          onCreate={(values) => createMutation.mutateAsync(values)}
          onCreated={() => { setCreateOpen(false); }}
        />
      )}
    </main>
  );
}
