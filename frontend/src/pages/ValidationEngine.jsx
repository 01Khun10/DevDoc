import { useEffect, useMemo, useState } from "react";
import { Icon } from "../components/ui";
import { useNavigate, useParams } from "react-router-dom";
import { useProject } from "../context/ProjectContext";
import { useRunValidation, useValidationRuns } from "../api/validation";
import { useProjectOverview } from "../api/projects";


const SEVERITY_ORDER = ["ERROR", "WARNING", "INFO"];
const SEV = {
  ERROR: { color: "var(--devdoc-error)", label: "Errors" },
  WARNING: { color: "var(--devdoc-warning)", label: "Warnings" },
  INFO: { color: "var(--devdoc-info)", label: "Info" },
};
function scoreColor(s) {
  if (s == null) return "var(--devdoc-muted)";
  if (s >= 80) return "var(--devdoc-success)";
  if (s >= 50) return "var(--devdoc-warning)";
  return "var(--devdoc-error)";
}

function Gauge({ score }) {
  const pct = score ?? 0, r = 48, c = 2 * Math.PI * r, off = c - (pct / 100) * c;
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={r} fill="none" stroke="var(--devdoc-border)" strokeWidth="8" />
      <circle cx="60" cy="60" r={r} fill="none" stroke={scoreColor(score)} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 60 60)" style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.2,0,0,1)" }} />
      <text x="60" y="56" textAnchor="middle" fontFamily="'Space Grotesk',sans-serif" fontSize="28" fontWeight="600" fill="var(--devdoc-text)">{score ?? "—"}</text>
      <text x="60" y="74" textAnchor="middle" fontFamily="ui-monospace,monospace" fontSize="9" fill="var(--devdoc-muted)">readiness</text>
    </svg>
  );
}

function Donut({ counts }) {
  const total = SEVERITY_ORDER.reduce((s, k) => s + (counts[k] || 0), 0);
  if (!total) return <div className="flex h-[120px] items-center justify-center text-sm text-[var(--devdoc-muted)]">No findings</div>;
  let acc = 0; const r = 44, c = 2 * Math.PI * r;
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={r} fill="none" stroke="var(--devdoc-border)" strokeWidth="12" />
      {SEVERITY_ORDER.map((k) => {
        const val = counts[k] || 0; if (!val) return null;
        const frac = val / total, dash = frac * c, gap = c - dash, offset = -acc * c;
        acc += frac;
        return <circle key={k} cx="60" cy="60" r={r} fill="none" stroke={SEV[k].color} strokeWidth="12"
          strokeDasharray={`${dash} ${gap}`} strokeDashoffset={offset} transform="rotate(-90 60 60)" />;
      })}
      <text x="60" y="64" textAnchor="middle" fontFamily="'Space Grotesk',sans-serif" fontSize="24" fontWeight="600" fill="var(--devdoc-text)">{total}</text>
    </svg>
  );
}

export default function ValidationEngine() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { project } = useProject();
  const runsQuery = useValidationRuns(id);
  const runMutation = useRunValidation(id);
  const overviewQuery = useProjectOverview(id);

  const [activeRun, setActiveRun] = useState(null);
  const [scanning, setScanning] = useState(false);

  const runs = runsQuery.data || [];
  useEffect(() => {
    if (!activeRun && runs.length) {
      const latest = [...runs].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0];
      setActiveRun(latest);
    }
  }, [runs, activeRun]);

  const sectionDocMap = useMemo(() => {
    const map = {};
    for (const doc of overviewQuery.data?.documents || [])
      for (const sid of doc.sectionIds || []) map[sid] = doc.id;
    return map;
  }, [overviewQuery.data]);

  const grouped = useMemo(() => {
    const results = activeRun?.results || [];
    return SEVERITY_ORDER.map((sev) => ({ sev, items: results.filter((r) => r.severity === sev) })).filter((g) => g.items.length);
  }, [activeRun]);

  const counts = useMemo(() => {
    const results = activeRun?.results || [];
    return SEVERITY_ORDER.reduce((a, s) => ({ ...a, [s]: results.filter((r) => r.severity === s).length }), {});
  }, [activeRun]);

  async function run() {
    setScanning(true);
    try {
      const newRun = await runMutation.mutateAsync();
      setActiveRun(newRun);
    } finally {
      setTimeout(() => setScanning(false), 700);
    }
  }

  function deepLink(result) {
    const base = `/projects/${id}`;
    if (result.targetType === "REQUIREMENT") navigate(`${base}/requirements?highlight=${result.targetId}`);
    else if (result.targetType === "USE_CASE") navigate(`${base}/use-cases?highlight=${result.targetId}`);
    else if (result.targetType === "DOCUMENT_SECTION" && sectionDocMap[result.targetId]) navigate(`${base}/documents/${sectionDocMap[result.targetId]}`);
    else if (result.ruleCode?.startsWith("TRC")) navigate(`${base}/traceability`);
  }

  const score = activeRun?.readinessScore ?? null;
  const neverRun = !runsQuery.isLoading && runs.length === 0;

  return (
    <main className="min-h-screen text-[var(--devdoc-text)]" style={{ backgroundColor: "var(--devdoc-bg)" }}>
      <div className="border-b px-6 py-5" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--devdoc-primary)]">{project.name}</p>
        <div className="mt-1.5 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-headline text-2xl font-bold tracking-tight">Validation</h1>
            <p className="mt-1 text-sm text-[var(--devdoc-muted)]">
              {activeRun ? `${counts.ERROR || 0} errors · ${counts.WARNING || 0} warnings · ${counts.INFO || 0} info` : "Doc-Linter"}
            </p>
          </div>
          <button onClick={run} disabled={runMutation.isPending}
            className="flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white disabled:opacity-70" style={{ backgroundColor: "var(--devdoc-primary)" }}>
            <Icon>{runMutation.isPending ? <path d="M21 12a9 9 0 1 1-6.219-8.56" /> : <path d="M5 3l14 9-14 9V3z" />}</Icon>
            {runMutation.isPending ? "Running…" : "Run validation"}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-6">
        {neverRun ? (
          <div className="flex flex-col items-center rounded-lg border px-6 py-16 text-center"
            style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)", backgroundImage: "linear-gradient(var(--devdoc-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--devdoc-grid-line) 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
            <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--devdoc-muted)]">Not validated yet</p>
            <h3 className="font-headline text-xl font-semibold">Run Doc-Linter to grade your documentation</h3>
            <p className="mt-2 max-w-sm text-sm text-[var(--devdoc-muted)]">Checks for missing sections, orphaned requirements, vague terms, and computes a readiness score.</p>
            <button onClick={run} className="mt-5 flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white" style={{ backgroundColor: "var(--devdoc-primary)" }}>
              <Icon><path d="M5 3l14 9-14 9V3z" /></Icon> Run validation
            </button>
          </div>
        ) : (
          <>
            {/* metrics row */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-6 rounded-lg border p-5" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
                <Gauge score={score} />
                <div className="grid grid-cols-1 gap-2">
                  {SEVERITY_ORDER.map((s) => (
                    <div key={s} className="flex items-center gap-2 text-sm">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SEV[s].color }} />
                      <span className="text-[var(--devdoc-muted)]">{SEV[s].label}</span>
                      <span className="font-semibold" style={{ color: SEV[s].color }}>{counts[s] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center rounded-lg border p-5" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
                <Donut counts={counts} />
              </div>
            </div>

            {/* findings with scan-line */}
            <div className="relative overflow-hidden rounded-lg border" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
              {scanning && (
                <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16"
                  style={{ background: "linear-gradient(to bottom, var(--devdoc-highlight-soft), transparent)", borderTop: "1px solid var(--devdoc-highlight)", animation: "devdoc-scan 0.7s ease-out forwards" }} />
              )}
              {grouped.length === 0 ? (
                <div className="flex flex-col items-center px-6 py-14 text-center">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: "var(--devdoc-success-soft)", color: "var(--devdoc-success)" }}>
                    <Icon size={20}><path d="M20 6 9 17l-5-5" /></Icon>
                  </div>
                  <p className="font-headline text-lg font-semibold">No issues found</p>
                  <p className="mt-1 text-sm text-[var(--devdoc-muted)]">Readiness {score ?? "—"} · your documentation passes every check.</p>
                </div>
              ) : (
                grouped.map((g) => (
                  <div key={g.sev}>
                    <div className="border-t px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] first:border-t-0"
                      style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface-inset)", color: SEV[g.sev].color }}>
                      {SEV[g.sev].label} · {g.items.length}
                    </div>
                    {g.items.map((r, i) => (
                      <div key={r.id || i} className="flex items-start gap-3 border-t px-4 py-3" style={{ borderColor: "var(--devdoc-border)" }}>
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: SEV[g.sev].color }} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm">{r.message}</p>
                          <p className="mt-0.5 font-mono text-[11px] text-[var(--devdoc-muted)]">
                            {r.ruleCode}{r.suggestedFix ? ` · ${r.suggestedFix}` : ""}
                          </p>
                        </div>
                        {(r.targetId || r.ruleCode?.startsWith("TRC")) && (
                          <button onClick={() => deepLink(r)}
                            className="shrink-0 rounded border px-2 py-1 text-[11px] text-[var(--devdoc-primary)] transition-colors hover:bg-[var(--devdoc-primary-soft)]"
                            style={{ borderColor: "var(--devdoc-border)" }}>
                            Open
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
