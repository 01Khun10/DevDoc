import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "../components/ui";
import { useParams, useSearchParams } from "react-router-dom";
import { useUseCases, useCreateUseCase } from "../api/useCases";
import CreateUseCaseForm from "../components/CreateUseCaseForm";


function Row({ uc, highlight }) {
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
  const links = uc.traceabilityLinks?.length ?? uc._count?.traceabilityLinks ?? 0;
  return (
    <div ref={ref} className="flex items-center gap-3 border-t px-4 py-3 transition-colors first:border-t-0 hover:bg-[var(--devdoc-surface-inset)]"
      style={{ borderColor: "var(--devdoc-border)" }}>
      <span className="font-mono text-[12px] font-medium" style={{ color: "var(--devdoc-artifact-uc)" }}>{uc.code}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">{uc.title}</p>
        {uc.description && <p className="truncate text-[12px] text-[var(--devdoc-muted)]">{uc.description}</p>}
      </div>
      {links > 0 ? (
        <span className="rounded px-2 py-0.5 font-mono text-[11px] text-[var(--devdoc-muted)]" style={{ backgroundColor: "var(--devdoc-surface-inset)" }}>{links} link{links === 1 ? "" : "s"}</span>
      ) : (
        <span className="rounded px-2 py-0.5 font-mono text-[11px]" style={{ color: "var(--devdoc-muted)", backgroundColor: "var(--devdoc-surface-inset)" }}>no links</span>
      )}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 border-t px-4 py-3" style={{ borderColor: "var(--devdoc-border)" }}>
      <div className="devdoc-skeleton h-4 w-14 rounded" />
      <div className="flex-1"><div className="devdoc-skeleton h-4 w-1/2 rounded" /></div>
      <div className="devdoc-skeleton h-5 w-14 rounded" />
    </div>
  );
}

export default function UseCaseRegistry() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight");

  const { data: useCases = [], isLoading, error, refetch } = useUseCases(id);
  const createMutation = useCreateUseCase(id);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [createOpen, setCreateOpen] = useState(false);

  const shown = useMemo(() => {
    let list = [...useCases];
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((u) => `${u.code} ${u.title} ${u.description || ""}`.toLowerCase().includes(q));
    if (sort === "code") list.sort((a, b) => (a.code || "").localeCompare(b.code || ""));
    else if (sort === "oldest") list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    else list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return list;
  }, [useCases, query, sort]);

  return (
    <main className="min-h-screen text-[var(--devdoc-text)]" style={{ backgroundColor: "var(--devdoc-bg)" }}>
      <div className="border-b px-6 py-5" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--devdoc-primary)]">Use cases</p>
        <div className="mt-1.5 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-headline text-2xl font-bold tracking-tight">Use cases</h1>
            <p className="mt-1 text-sm text-[var(--devdoc-muted)]">{useCases.length} use case{useCases.length === 1 ? "" : "s"}</p>
          </div>
          <button onClick={() => setCreateOpen(true)} className="flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white" style={{ backgroundColor: "var(--devdoc-primary)" }}>
            <Icon><path d="M12 5v14M5 12h14" /></Icon> Add use case
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-6">
        {useCases.length > 0 && (
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--devdoc-muted)]">
                <Icon><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></Icon>
              </span>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search use cases…"
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
              <p className="text-sm text-[var(--devdoc-muted)]">Could not load use cases.</p>
              <button onClick={() => refetch()} className="mt-3 rounded-md border px-4 py-2 text-sm" style={{ borderColor: "var(--devdoc-border)" }}>Retry</button>
            </div>
          ) : isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          ) : useCases.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center"
              style={{ backgroundImage: "linear-gradient(var(--devdoc-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--devdoc-grid-line) 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
              <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--devdoc-muted)]">No use cases yet</p>
              <h3 className="font-headline text-xl font-semibold">Describe how actors use the system</h3>
              <p className="mt-2 max-w-sm text-sm text-[var(--devdoc-muted)]">Use cases come before requirements — add the first one.</p>
              <button onClick={() => setCreateOpen(true)} className="mt-5 flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white" style={{ backgroundColor: "var(--devdoc-primary)" }}>
                <Icon><path d="M12 5v14M5 12h14" /></Icon> Add use case
              </button>
            </div>
          ) : shown.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-[var(--devdoc-muted)]">No use cases match “{query}”.</p>
          ) : (
            shown.map((uc) => <Row key={uc.id} uc={uc} highlight={uc.id === highlightId} />)
          )}
        </div>
      </div>

      {createOpen && (
        <CreateUseCaseForm onClose={() => setCreateOpen(false)} onCreate={(v) => createMutation.mutateAsync(v)} onCreated={() => setCreateOpen(false)} />
      )}
    </main>
  );
}
