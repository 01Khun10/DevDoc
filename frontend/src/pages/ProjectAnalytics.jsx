import { useMemo } from "react";
import { Icon } from "../components/ui";
import { useParams } from "react-router-dom";
import { useProjectOverview } from "../api/projects";
import { useValidationRuns } from "../api/validation";


const ARTIFACTS = [
  ["Documents", "documents", "var(--devdoc-artifact-sec)"],
  ["Use cases", "useCases", "var(--devdoc-artifact-uc)"],
  ["Requirements", "requirements", "var(--devdoc-artifact-fr)"],
  ["Design elements", "designElements", "var(--devdoc-artifact-de)"],
  ["Test cases", "testCases", "var(--devdoc-artifact-tc)"],
  ["Links", "traceabilityLinks", "var(--devdoc-highlight)"],
];

function StatCard({ label, value, color }) {
  return (
    <div className="rounded-lg border p-4" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
      <div className="mb-2 h-1 w-8 rounded-full" style={{ backgroundColor: color }} />
      <p className="font-headline text-2xl font-semibold">{value ?? 0}</p>
      <p className="text-[12px] text-[var(--devdoc-muted)]">{label}</p>
    </div>
  );
}

/* Simple SVG line chart for readiness trend (no dependency needed) */
function TrendChart({ runs }) {
  const points = useMemo(() => {
    const sorted = [...runs].filter((r) => r.readinessScore != null).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return sorted.map((r) => r.readinessScore);
  }, [runs]);

  if (points.length < 2) {
    return <div className="flex h-40 items-center justify-center text-sm text-[var(--devdoc-muted)]">Run validation a few times to see a trend.</div>;
  }
  const W = 600, H = 160, pad = 24;
  const max = 100, min = 0;
  const stepX = (W - pad * 2) / (points.length - 1);
  const y = (v) => H - pad - ((v - min) / (max - min)) * (H - pad * 2);
  const path = points.map((v, i) => `${i === 0 ? "M" : "L"} ${pad + i * stepX} ${y(v)}`).join(" ");
  const area = `${path} L ${pad + (points.length - 1) * stepX} ${H - pad} L ${pad} ${H - pad} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[0, 25, 50, 75, 100].map((g) => (
        <g key={g}>
          <line x1={pad} y1={y(g)} x2={W - pad} y2={y(g)} stroke="var(--devdoc-border)" strokeWidth="0.5" />
          <text x={pad - 6} y={y(g) + 3} textAnchor="end" fontFamily="ui-monospace,monospace" fontSize="9" fill="var(--devdoc-subtle)">{g}</text>
        </g>
      ))}
      <path d={area} fill="var(--devdoc-highlight-soft)" />
      <path d={path} fill="none" stroke="var(--devdoc-highlight)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((v, i) => <circle key={i} cx={pad + i * stepX} cy={y(v)} r="3" fill="var(--devdoc-highlight)" />)}
    </svg>
  );
}

export default function ProjectAnalytics() {
  const { id } = useParams();
  const { data: overview, isLoading } = useProjectOverview(id);
  const { data: runs = [] } = useValidationRuns(id);
  const counts = overview?.counts || {};
  const documents = overview?.documents || [];

  const docCompletion = useMemo(() => documents.map((d) => {
    const secs = d.sections || [];
    const done = secs.filter((s) => s.status === "COMPLETE" || (s.content && s.content.trim())).length;
    return { title: d.title, pct: secs.length ? Math.round((done / secs.length) * 100) : 0 };
  }), [documents]);

  return (
    <main className="min-h-screen text-[var(--devdoc-text)]" style={{ backgroundColor: "var(--devdoc-bg)" }}>
      <div className="border-b px-6 py-5" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--devdoc-primary)]">Analytics</p>
        <h1 className="mt-1.5 font-headline text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-[var(--devdoc-muted)]">Project health over time</p>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-6">
        {isLoading ? (
          <div className="devdoc-skeleton h-40 w-full rounded-lg" />
        ) : (
          <>
            <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {ARTIFACTS.map(([label, key, color]) => <StatCard key={key} label={label} value={counts[key]} color={color} />)}
            </section>

            <section className="mb-6 rounded-lg border p-5" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
              <div className="mb-4 flex items-center gap-2">
                <Icon size={16}><path d="M3 3v18h18M18 9l-5 5-3-3-4 4" /></Icon>
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--devdoc-muted)]">Readiness trend</p>
              </div>
              <TrendChart runs={runs} />
            </section>

            <section className="rounded-lg border p-5" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
              <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--devdoc-muted)]">Document completion</p>
              {docCompletion.length === 0 ? (
                <p className="text-sm text-[var(--devdoc-muted)]">No documents yet.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {docCompletion.map((d) => {
                    const color = d.pct >= 80 ? "var(--devdoc-success)" : d.pct >= 50 ? "var(--devdoc-warning)" : "var(--devdoc-error)";
                    return (
                      <div key={d.title}>
                        <div className="mb-1 flex items-center justify-between text-[13px]">
                          <span className="truncate">{d.title}</span>
                          <span className="font-mono" style={{ color }}>{d.pct}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: "var(--devdoc-surface-inset)" }}>
                          <div className="h-full rounded-full" style={{ width: `${d.pct}%`, backgroundColor: color, transition: "width 500ms ease" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
