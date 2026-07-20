import { useMemo, useState } from "react";
import { Icon } from "../components/ui";
import { Link, useNavigate } from "react-router-dom";
import CreateProjectForm from "../components/CreateProjectForm";
import WelcomeOverlay from "./WelcomeOverlay";
import useAuth from "../hooks/useAuth";
import { useProjects } from "../api/projects";
import useAuthGuard from "../api/useAuthGuard";


function initials(name = "") {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "P") + (parts[1]?.[0] || "")).toUpperCase();
}
function relTime(iso) {
  if (!iso) return "—";
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 3600) return `${Math.max(1, Math.floor(d / 60))}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

function ProjectSheet({ project }) {
  return (
    <Link
      to={`/projects/${project.id}`}
      className="group relative flex flex-col justify-between rounded-lg border p-5 transition-transform duration-200 hover:-translate-y-1"
      style={{
        backgroundColor: "var(--devdoc-surface)",
        borderColor: "var(--devdoc-border)",
        backgroundImage: "linear-gradient(var(--devdoc-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--devdoc-grid-line) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
        minHeight: "168px",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 10px 26px rgba(6,12,24,0.35)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      <div>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded border font-mono text-[12px] font-semibold"
            style={{ borderColor: "var(--devdoc-primary)", color: "var(--devdoc-primary)", backgroundColor: "var(--devdoc-primary-soft)" }}>
            {initials(project.name)}
          </div>
          <span className="font-mono text-[10px] text-[var(--devdoc-subtle)]">{project.profile?.code || "PROJECT"}</span>
        </div>
        <h3 className="font-headline text-base font-semibold leading-snug">{project.name}</h3>
        <p className="mt-1 line-clamp-2 text-[13px] text-[var(--devdoc-muted)]">
          {project.description || "No description provided."}
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between border-t pt-3" style={{ borderColor: "var(--devdoc-border)" }}>
        <span className="font-mono text-[10px] text-[var(--devdoc-subtle)]">updated {relTime(project.updatedAt)}</span>
        <span className="flex items-center gap-1 text-[var(--devdoc-primary)] opacity-0 transition-opacity group-hover:opacity-100">
          <span className="text-[11px]">Open</span><Icon size={13}><path d="M5 12h14M12 5l7 7-7 7" /></Icon>
        </span>
      </div>
    </Link>
  );
}

function SheetSkeleton() {
  return (
    <div className="rounded-lg border p-5" style={{ backgroundColor: "var(--devdoc-surface)", borderColor: "var(--devdoc-border)", minHeight: "168px" }}>
      <div className="devdoc-skeleton mb-3 h-9 w-9 rounded" />
      <div className="devdoc-skeleton mb-2 h-4 w-2/3 rounded" />
      <div className="devdoc-skeleton h-3 w-full rounded" />
      <div className="devdoc-skeleton mt-2 h-3 w-4/5 rounded" />
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recent");
  const { data: projects = [], isLoading, error, refetch } = useProjects();
  useAuthGuard(error);

  const shown = useMemo(() => {
    let list = [...projects];
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((p) => `${p.name || ""} ${p.description || ""}`.toLowerCase().includes(q));
    if (sort === "name") list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    else list.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    return list;
  }, [projects, query, sort]);

  async function onCreated() {
    setCreateOpen(false);
    await refetch();
  }

  return (
    <main className="min-h-screen text-[var(--devdoc-text)]"
      style={{
        backgroundColor: "var(--devdoc-bg)",
        backgroundImage: "linear-gradient(var(--devdoc-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--devdoc-grid-line) 1px, transparent 1px)",
        backgroundSize: "24px 24px", backgroundAttachment: "fixed",
      }}>
      <WelcomeOverlay onCreateProject={() => setCreateOpen(true)} onTour={() => navigate("/help")} />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {/* header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--devdoc-primary)]">Your workspace</p>
            <h1 className="mt-1.5 font-headline text-2xl font-bold tracking-tight">
              Welcome back{user?.name ? `, ${user.name}` : ""}
            </h1>
            <p className="mt-1 text-sm text-[var(--devdoc-muted)]">
              {projects.length > 0 ? `${projects.length} project${projects.length === 1 ? "" : "s"}` : "No projects yet"}
            </p>
          </div>
          <button onClick={() => setCreateOpen(true)}
            className="flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: "var(--devdoc-primary)" }}>
            <Icon size={16}><path d="M12 5v14M5 12h14" /></Icon> New project
          </button>
        </div>

        {/* controls */}
        {projects.length > 0 && (
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--devdoc-muted)]">
                <Icon size={16}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></Icon>
              </span>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search projects…"
                className="w-full rounded-md border py-2 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-[var(--devdoc-subtle)] focus:border-[var(--devdoc-highlight)]"
                style={{ backgroundColor: "var(--devdoc-surface-inset)", borderColor: "var(--devdoc-border)", color: "var(--devdoc-text)" }} />
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="rounded-md border px-3 py-2 text-sm outline-none focus:border-[var(--devdoc-highlight)]"
              style={{ backgroundColor: "var(--devdoc-surface-inset)", borderColor: "var(--devdoc-border)", color: "var(--devdoc-text)" }}>
              <option value="recent">Recent</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
        )}

        {/* body */}
        {error ? (
          <div className="rounded-lg border p-8 text-center" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
            <p className="text-sm text-[var(--devdoc-muted)]">Could not load projects. Check your connection.</p>
            <button onClick={() => refetch()} className="mt-3 rounded-md border px-4 py-2 text-sm" style={{ borderColor: "var(--devdoc-border)" }}>Retry</button>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <SheetSkeleton key={i} />)}
          </div>
        ) : shown.length === 0 && !query ? (
          <div className="flex flex-col items-center rounded-lg border px-6 py-16 text-center"
            style={{
              borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)",
              backgroundImage: "linear-gradient(var(--devdoc-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--devdoc-grid-line) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border text-[var(--devdoc-primary)]"
              style={{ borderColor: "var(--devdoc-primary)" }}>
              <Icon size={24}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></Icon>
            </div>
            <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--devdoc-muted)]">No projects yet</p>
            <h3 className="font-headline text-xl font-semibold">Create your first blueprint</h3>
            <p className="mt-2 max-w-sm text-sm text-[var(--devdoc-muted)]">
              Structure your software documentation from objective to verified test.
            </p>
            <button onClick={() => setCreateOpen(true)}
              className="mt-5 flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white"
              style={{ backgroundColor: "var(--devdoc-primary)" }}>
              <Icon size={16}><path d="M12 5v14M5 12h14" /></Icon> New project
            </button>
          </div>
        ) : shown.length === 0 ? (
          <p className="py-10 text-center text-sm text-[var(--devdoc-muted)]">No projects match “{query}”.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((p) => <ProjectSheet key={p.id} project={p} />)}
            <button onClick={() => setCreateOpen(true)}
              className="flex min-h-[168px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-[var(--devdoc-muted)] transition-colors hover:border-[var(--devdoc-primary)] hover:text-[var(--devdoc-primary)]"
              style={{ borderColor: "var(--devdoc-border-strong)" }}>
              <Icon size={22}><path d="M12 5v14M5 12h14" /></Icon>
              <span className="text-sm">New project</span>
            </button>
          </div>
        )}
      </div>

      {createOpen && <CreateProjectForm onClose={() => setCreateOpen(false)} onCreated={onCreated} />}
    </main>
  );
}
