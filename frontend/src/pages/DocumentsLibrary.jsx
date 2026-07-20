import { useMemo, useState } from "react";
import { Icon } from "../components/ui";
import { Link, useParams } from "react-router-dom";
import { useProjectOverview } from "../api/projects";


const TYPE_COLOR = {
  SCOPE: "var(--devdoc-artifact-uc)", SRS: "var(--devdoc-artifact-fr)",
  SDS: "var(--devdoc-artifact-de)", STP: "var(--devdoc-artifact-sec)",
};
function completion(doc) {
  const secs = doc.sections || [];
  const required = secs.filter((s) => s.isRequired);
  const base = required.length ? required : secs;
  if (!base.length) return 0;
  const done = base.filter((s) => s.status === "COMPLETE" || (s.content && s.content.trim())).length;
  return Math.round((done / base.length) * 100);
}
function barColor(p) { return p >= 80 ? "var(--devdoc-success)" : p >= 50 ? "var(--devdoc-warning)" : "var(--devdoc-error)"; }

function DocCard({ doc, projectId }) {
  const [open, setOpen] = useState(false);
  const pct = completion(doc);
  const color = TYPE_COLOR[doc.documentType] || "var(--devdoc-primary)";
  const secs = doc.sections || [];
  return (
    <div className="overflow-hidden rounded-lg border" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
      <div className="flex" >
        <div className="w-1.5 flex-shrink-0" style={{ backgroundColor: color }} />
        <div className="flex-1 p-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded px-2 py-0.5 font-mono text-[11px] font-medium" style={{ color, backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)` }}>{doc.documentType}</span>
            <span className="rounded px-2 py-0.5 text-[10px] font-medium"
              style={doc.status === "COMPLETE" ? { color: "var(--devdoc-success)", backgroundColor: "var(--devdoc-success-soft)" } : { color: "var(--devdoc-muted)", backgroundColor: "var(--devdoc-surface-inset)" }}>
              {(doc.status || "DRAFT").toLowerCase()}
            </span>
          </div>
          <h3 className="font-headline text-lg font-semibold">{doc.title}</h3>
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className="text-[var(--devdoc-muted)]">Completion</span>
              <span className="font-mono" style={{ color: barColor(pct) }}>{pct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: "var(--devdoc-surface-inset)" }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: barColor(pct), transition: "width 500ms ease" }} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Link to={`/projects/${projectId}/documents/${doc.id}`}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white" style={{ backgroundColor: "var(--devdoc-primary)" }}>
              <Icon size={15}><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></Icon> Open editor
            </Link>
            <button onClick={() => setOpen((o) => !o)} className="rounded-md border px-3 py-2 text-sm" style={{ borderColor: "var(--devdoc-border)", color: "var(--devdoc-text-secondary)" }}>
              {open ? "Hide sections" : `View sections (${secs.length})`}
            </button>
          </div>
        </div>
      </div>
      {open && (
        <div className="border-t px-5 py-3" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface-inset)" }}>
          <ul className="flex flex-col gap-1">
            {secs.map((s) => {
              const done = s.status === "COMPLETE" || (s.content && s.content.trim());
              return (
                <li key={s.id} className="flex items-center gap-2 text-[13px]">
                  <span style={{ color: done ? "var(--devdoc-success)" : "var(--devdoc-muted)" }}>{done ? "✓" : (s.content ? "○" : "—")}</span>
                  <span className="text-[var(--devdoc-text-secondary)]">{s.title || s.heading || "Untitled section"}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function DocumentsLibrary() {
  const { id } = useParams();
  const { data: overview, isLoading, error, refetch } = useProjectOverview(id);
  const documents = overview?.documents || [];

  const stats = useMemo(() => {
    let sections = 0, completed = 0;
    for (const d of documents) {
      const secs = d.sections || [];
      sections += secs.length;
      completed += secs.filter((s) => s.status === "COMPLETE" || (s.content && s.content.trim())).length;
    }
    return { docs: documents.length, sections, completed, pct: sections ? Math.round((completed / sections) * 100) : 0 };
  }, [documents]);

  return (
    <main className="min-h-screen text-[var(--devdoc-text)]" style={{ backgroundColor: "var(--devdoc-bg)" }}>
      <div className="border-b px-6 py-5" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--devdoc-primary)]">Documents</p>
        <div className="mt-1.5 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-headline text-2xl font-bold tracking-tight">Documents</h1>
            <p className="mt-1 text-sm text-[var(--devdoc-muted)]">{documents.length} document{documents.length === 1 ? "" : "s"}</p>
          </div>
          <Link to={`/projects/${id}/templates`} className="flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white" style={{ backgroundColor: "var(--devdoc-primary)" }}>
            <Icon size={16}><path d="M12 5v14M5 12h14" /></Icon> New from template
          </Link>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[1fr_260px]">
        <div className="flex flex-col gap-4">
          {error ? (
            <div className="rounded-lg border p-8 text-center" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
              <p className="text-sm text-[var(--devdoc-muted)]">Could not load documents.</p>
              <button onClick={() => refetch()} className="mt-3 rounded-md border px-4 py-2 text-sm" style={{ borderColor: "var(--devdoc-border)" }}>Retry</button>
            </div>
          ) : isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-5" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
                <div className="devdoc-skeleton mb-2 h-5 w-16 rounded" /><div className="devdoc-skeleton mb-3 h-6 w-1/2 rounded" /><div className="devdoc-skeleton h-1.5 w-full rounded" />
              </div>
            ))
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center rounded-lg border px-6 py-16 text-center"
              style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)", backgroundImage: "linear-gradient(var(--devdoc-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--devdoc-grid-line) 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border text-[var(--devdoc-primary)]" style={{ borderColor: "var(--devdoc-primary)" }}>
                <Icon size={24}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></Icon>
              </div>
              <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--devdoc-muted)]">No documents yet</p>
              <h3 className="font-headline text-xl font-semibold">Start from a structured template</h3>
              <p className="mt-2 max-w-sm text-sm text-[var(--devdoc-muted)]">Create your first document from a professionally structured template.</p>
              <Link to={`/projects/${id}/templates`} className="mt-5 flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white" style={{ backgroundColor: "var(--devdoc-primary)" }}>
                Browse templates
              </Link>
            </div>
          ) : (
            documents.map((doc) => <DocCard key={doc.id} doc={doc} projectId={id} />)
          )}
        </div>

        {/* right rail */}
        <aside className="flex flex-col gap-4">
          <div className="rounded-lg border p-4" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--devdoc-muted)]">Coverage</p>
            <div className="grid grid-cols-2 gap-3">
              {[["Documents", stats.docs], ["Sections", stats.sections], ["Completed", stats.completed], ["Overall", `${stats.pct}%`]].map(([l, v]) => (
                <div key={l}><p className="font-headline text-xl font-semibold">{v}</p><p className="text-[11px] text-[var(--devdoc-muted)]">{l}</p></div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
