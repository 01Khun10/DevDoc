import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "../components/ui";
import { useParams, useSearchParams } from "react-router-dom";
import {
  useDesignElements, useCreateDesignElement, useUpdateDesignElement, useDeleteDesignElement,
} from "../api/designElements";


const TYPES = ["COMPONENT", "MODULE", "INTERFACE", "CLASS", "SERVICE"];

function TypeSelect({ value, onChange, pending }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    if (open) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} disabled={pending}
        className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition-colors disabled:opacity-60"
        style={{ color: "var(--devdoc-artifact-de)", backgroundColor: "color-mix(in srgb, var(--devdoc-artifact-de) 14%, transparent)" }}>
        {pending ? "…" : (value || "type").toLowerCase()}
        <Icon size={11}><path d="M6 9l6 6 6-6" /></Icon>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 min-w-[130px] overflow-hidden rounded-md border py-1 shadow-lg"
          style={{ backgroundColor: "var(--devdoc-surface)", borderColor: "var(--devdoc-border)" }}>
          {TYPES.map((t) => (
            <button key={t} onClick={() => { onChange(t); setOpen(false); }}
              className="block w-full px-3 py-1.5 text-left text-[12px] capitalize transition-colors hover:bg-[var(--devdoc-surface-inset)]">
              {t.toLowerCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ de, highlight, onUpdate, onDelete, pending }) {
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
  const links = de.traceabilityLinks?.length ?? de._count?.traceabilityLinks ?? 0;
  return (
    <div ref={ref} className="group flex items-center gap-3 border-t px-4 py-3 transition-colors first:border-t-0 hover:bg-[var(--devdoc-surface-inset)]"
      style={{ borderColor: "var(--devdoc-border)" }}>
      <span className="font-mono text-[12px] font-medium" style={{ color: "var(--devdoc-artifact-de)" }}>{de.code}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">{de.title}</p>
        {de.description && <p className="truncate text-[12px] text-[var(--devdoc-muted)]">{de.description}</p>}
      </div>
      <TypeSelect value={de.elementType} pending={pending === "type"} onChange={(v) => onUpdate({ elementType: v })} />
      <span className="rounded px-2 py-0.5 font-mono text-[11px] text-[var(--devdoc-muted)]" style={{ backgroundColor: "var(--devdoc-surface-inset)" }}>
        {links} link{links === 1 ? "" : "s"}
      </span>
      <button onClick={() => onDelete(de)} aria-label="Delete"
        className="text-[var(--devdoc-muted)] opacity-0 transition-opacity hover:text-[var(--devdoc-error)] group-hover:opacity-100">
        <Icon><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></Icon>
      </button>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 border-t px-4 py-3" style={{ borderColor: "var(--devdoc-border)" }}>
      <div className="devdoc-skeleton h-4 w-14 rounded" />
      <div className="flex-1"><div className="devdoc-skeleton h-4 w-1/2 rounded" /></div>
      <div className="devdoc-skeleton h-5 w-20 rounded" />
    </div>
  );
}

export default function DesignElementRegistry() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight");

  const { data: elements = [], isLoading, error, refetch } = useDesignElements(id);
  const createMutation = useCreateDesignElement(id);
  const updateMutation = useUpdateDesignElement(id);
  const deleteMutation = useDeleteDesignElement(id);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [form, setForm] = useState({ title: "", description: "", elementType: "" });
  const [showForm, setShowForm] = useState(false);
  const [pending, setPending] = useState({});

  const shown = useMemo(() => {
    let list = [...elements];
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((d) => `${d.code} ${d.title} ${d.description || ""}`.toLowerCase().includes(q));
    if (sort === "code") list.sort((a, b) => (a.code || "").localeCompare(b.code || ""));
    else if (sort === "oldest") list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    else list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return list;
  }, [elements, query, sort]);

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    await createMutation.mutateAsync({
      title: form.title, description: form.description || null, elementType: form.elementType || null,
    });
    setForm({ title: "", description: "", elementType: "" });
    setShowForm(false);
  }
  async function update(deId, patch) {
    setPending((p) => ({ ...p, [deId]: "type" }));
    try { await updateMutation.mutateAsync({ designElementId: deId, ...patch }); }
    finally { setPending((p) => { const n = { ...p }; delete n[deId]; return n; }); }
  }
  async function remove(de) {
    if (!window.confirm(`Delete design element ${de.code}?`)) return;
    await deleteMutation.mutateAsync(de.id);
  }

  return (
    <main className="min-h-screen text-[var(--devdoc-text)]" style={{ backgroundColor: "var(--devdoc-bg)" }}>
      <div className="border-b px-6 py-5" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--devdoc-primary)]">Design elements</p>
        <div className="mt-1.5 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-headline text-2xl font-bold tracking-tight">Design elements</h1>
            <p className="mt-1 text-sm text-[var(--devdoc-muted)]">{elements.length} element{elements.length === 1 ? "" : "s"}</p>
          </div>
          <button onClick={() => setShowForm((s) => !s)} className="flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white" style={{ backgroundColor: "var(--devdoc-primary)" }}>
            <Icon><path d="M12 5v14M5 12h14" /></Icon> Add design element
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-6">
        {showForm && (
          <form onSubmit={submit} className="mb-4 grid gap-3 rounded-lg border p-4 sm:grid-cols-[1fr_160px_auto]"
            style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
            <input autoFocus value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Design element title" className="rounded-md border px-3 py-2 text-sm outline-none focus:border-[var(--devdoc-highlight)]"
              style={{ backgroundColor: "var(--devdoc-surface-inset)", borderColor: "var(--devdoc-border)", color: "var(--devdoc-text)" }} />
            <select value={form.elementType} onChange={(e) => setForm((f) => ({ ...f, elementType: e.target.value }))}
              className="rounded-md border px-3 py-2 text-sm outline-none focus:border-[var(--devdoc-highlight)]"
              style={{ backgroundColor: "var(--devdoc-surface-inset)", borderColor: "var(--devdoc-border)", color: "var(--devdoc-text)" }}>
              <option value="">Type…</option>
              {TYPES.map((t) => <option key={t} value={t}>{t[0] + t.slice(1).toLowerCase()}</option>)}
            </select>
            <button type="submit" disabled={createMutation.isPending} className="rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-70" style={{ backgroundColor: "var(--devdoc-primary)" }}>
              {createMutation.isPending ? "Saving…" : "Create"}
            </button>
          </form>
        )}

        {elements.length > 0 && (
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--devdoc-muted)]">
                <Icon><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></Icon>
              </span>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search design elements…"
                className="w-full rounded-md border py-2 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-[var(--devdoc-subtle)] focus:border-[var(--devdoc-highlight)]"
                style={{ backgroundColor: "var(--devdoc-surface-inset)", borderColor: "var(--devdoc-border)", color: "var(--devdoc-text)" }} />
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-md border px-3 py-2 text-sm outline-none focus:border-[var(--devdoc-highlight)]"
              style={{ backgroundColor: "var(--devdoc-surface-inset)", borderColor: "var(--devdoc-border)", color: "var(--devdoc-text)" }}>
              <option value="newest">Newest</option><option value="oldest">Oldest</option><option value="code">Code A–Z</option>
            </select>
          </div>
        )}

        <div className="overflow-hidden rounded-lg border" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
          {error ? (
            <div className="p-8 text-center">
              <p className="text-sm text-[var(--devdoc-muted)]">Could not load design elements.</p>
              <button onClick={() => refetch()} className="mt-3 rounded-md border px-4 py-2 text-sm" style={{ borderColor: "var(--devdoc-border)" }}>Retry</button>
            </div>
          ) : isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          ) : elements.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center"
              style={{ backgroundImage: "linear-gradient(var(--devdoc-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--devdoc-grid-line) 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
              <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--devdoc-muted)]">No design elements yet</p>
              <h3 className="font-headline text-xl font-semibold">Capture your architecture</h3>
              <p className="mt-2 max-w-sm text-sm text-[var(--devdoc-muted)]">Design elements link requirements to the components that implement them.</p>
              <button onClick={() => setShowForm(true)} className="mt-5 flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white" style={{ backgroundColor: "var(--devdoc-primary)" }}>
                <Icon><path d="M12 5v14M5 12h14" /></Icon> Add design element
              </button>
            </div>
          ) : shown.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-[var(--devdoc-muted)]">No design elements match “{query}”.</p>
          ) : (
            shown.map((de) => (
              <Row key={de.id} de={de} highlight={de.id === highlightId} pending={pending[de.id]}
                onUpdate={(patch) => update(de.id, patch)} onDelete={remove} />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
