import { useMemo } from "react";
import { Icon } from "../components/ui";
import { Link } from "react-router-dom";
import { useProject } from "../context/ProjectContext";
import { useProjectOverview } from "../api/projects";
import { useValidationRuns } from "../api/validation";


function scoreColor(s) {
  if (s == null) return "var(--devdoc-muted)";
  if (s >= 80) return "var(--devdoc-success)";
  if (s >= 50) return "var(--devdoc-warning)";
  return "var(--devdoc-error)";
}

function ReadinessGauge({ score }) {
  const pct = score ?? 0;
  const r = 52, c = 2 * Math.PI * r, off = c - (pct / 100) * c;
  const color = scoreColor(score);
  return (
    <svg width="128" height="128" viewBox="0 0 128 128">
      <circle cx="64" cy="64" r={r} fill="none" stroke="var(--devdoc-border)" strokeWidth="9" />
      <circle cx="64" cy="64" r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 64 64)"
        style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.2,0,0,1)" }} />
      <text x="64" y="60" textAnchor="middle" fontFamily="'Space Grotesk',sans-serif" fontSize="30" fontWeight="600" fill="var(--devdoc-text)">
        {score ?? "—"}
      </text>
      <text x="64" y="80" textAnchor="middle" fontFamily="ui-monospace,monospace" fontSize="10" fill="var(--devdoc-muted)">readiness</text>
    </svg>
  );
}

const STEPS = [
  { label: "Create a document", key: "documents", path: "templates" },
  { label: "Add a use case", key: "useCases", path: "use-cases" },
  { label: "Register a requirement", key: "requirements", path: "requirements" },
  { label: "Link artifacts", key: "traceabilityLinks", path: "traceability" },
  { label: "Run validation", key: "validationRuns", path: "validation" },
];

const TOOLS = [
  { label: "Documents", path: "documents", key: "documents", icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></> },
  { label: "Requirements", path: "requirements", key: "requirements", icon: <><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></> },
  { label: "Traceability", path: "traceability", key: "traceabilityLinks", icon: <><rect x="3" y="3" width="6" height="6" rx="1" /><rect x="15" y="15" width="6" height="6" rx="1" /><path d="M9 6h6a3 3 0 0 1 3 3v6" /></> },
  { label: "Validation", path: "validation", key: "validationRuns", icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></> },
  { label: "Diagrams", path: "diagrams", key: null, icon: <><rect x="3" y="3" width="6" height="6" rx="1" /><rect x="15" y="3" width="6" height="6" rx="1" /><rect x="9" y="15" width="6" height="6" rx="1" /><path d="M6 9v2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9M12 13v2" /></> },
];

export default function ProjectWorkspace() {
  const { project } = useProject();
  const { data: overview, isLoading } = useProjectOverview(project.id);
  const { data: runs = [] } = useValidationRuns(project.id);

  const counts = overview?.counts || {};
  const latestScore = useMemo(() => {
    if (!runs.length) return null;
    const sorted = [...runs].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return sorted[0]?.readinessScore ?? null;
  }, [runs]);

  const doneCount = STEPS.filter((s) => (counts[s.key] || 0) > 0).length;
  const base = (p) => `/projects/${project.id}/${p}`;

  return (
    <main className="min-h-screen text-[var(--devdoc-text)]" style={{ backgroundColor: "var(--devdoc-bg)" }}>
      <div className="border-b px-6 py-5" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--devdoc-primary)]">{project.name}</p>
        <h1 className="mt-1.5 font-headline text-2xl font-bold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-[var(--devdoc-muted)]">{project.description || "Project workspace"}</p>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-6">
        {/* readiness hero */}
        <section className="mb-6 grid grid-cols-1 gap-6 rounded-lg border p-6 md:grid-cols-[auto_1fr]"
          style={{
            borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)",
            backgroundImage: "linear-gradient(var(--devdoc-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--devdoc-grid-line) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}>
          <div className="flex items-center justify-center"><ReadinessGauge score={latestScore} /></div>
          <div className="flex flex-col justify-center">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--devdoc-muted)]">Artifact coverage</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
              {[["Documents", counts.documents], ["Use cases", counts.useCases], ["Requirements", counts.requirements],
                ["Design elements", counts.designElements], ["Test cases", counts.testCases], ["Links", counts.traceabilityLinks]].map(([label, n]) => (
                <div key={label}>
                  <p className="font-headline text-2xl font-semibold">{isLoading ? "—" : (n ?? 0)}</p>
                  <p className="text-[12px] text-[var(--devdoc-muted)]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* checklist */}
          <section className="rounded-lg border p-6" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
            <div className="mb-4 flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--devdoc-muted)]">Getting to readiness</p>
              <span className="font-mono text-[12px] text-[var(--devdoc-muted)]">{doneCount} / {STEPS.length}</span>
            </div>
            <div className="flex flex-col gap-1">
              {STEPS.map((s, i) => {
                const done = (counts[s.key] || 0) > 0;
                return (
                  <Link key={s.key} to={base(s.path)}
                    className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-[var(--devdoc-surface-inset)]">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-[11px] font-mono"
                      style={done
                        ? { borderColor: "var(--devdoc-success)", color: "var(--devdoc-success)", backgroundColor: "var(--devdoc-success-soft)" }
                        : { borderColor: "var(--devdoc-border)", color: "var(--devdoc-muted)" }}>
                      {done ? <Icon size={13}><path d="M20 6 9 17l-5-5" /></Icon> : i + 1}
                    </span>
                    <span className="flex-1 text-sm" style={done ? { color: "var(--devdoc-muted)", textDecoration: "line-through" } : undefined}>{s.label}</span>
                    <span className="rounded px-2 py-0.5 text-[10px] font-medium"
                      style={done
                        ? { color: "var(--devdoc-success)", backgroundColor: "var(--devdoc-success-soft)" }
                        : { color: "var(--devdoc-muted)", backgroundColor: "var(--devdoc-surface-inset)" }}>
                      {done ? "done" : "pending"}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* tools */}
          <section className="rounded-lg border p-6" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--devdoc-muted)]">Jump to</p>
            <div className="grid grid-cols-2 gap-3">
              {TOOLS.map((t) => (
                <Link key={t.path} to={base(t.path)}
                  className="flex items-center gap-3 rounded-lg border p-3 transition-all hover:-translate-y-0.5 hover:border-[var(--devdoc-primary)]"
                  style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface-inset)" }}>
                  <span className="text-[var(--devdoc-primary)]"><Icon>{t.icon}</Icon></span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{t.label}</p>
                    {t.key && <p className="font-mono text-[11px] text-[var(--devdoc-muted)]">{counts[t.key] ?? 0}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
