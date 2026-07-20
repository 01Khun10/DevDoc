import { useQuery } from "@tanstack/react-query";
import { Icon } from "../components/ui";
import { useParams } from "react-router-dom";
import apiRequest from "../services/api";


const SEVERITY_ORDER = ["ERROR", "WARNING", "INFO"];
const SEVERITY = {
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
  const pct = score ?? 0, r = 46, c = 2 * Math.PI * r, off = c - (pct / 100) * c;
  const color = scoreColor(score);
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={r} fill="none" stroke="var(--devdoc-border)" strokeWidth="8" />
      <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 60 60)"
        style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.2,0,0,1)" }} />
      <text x="60" y="56" textAnchor="middle" fontFamily="'Space Grotesk',sans-serif" fontSize="28" fontWeight="600" fill="var(--devdoc-text)">{score ?? "—"}</text>
      <text x="60" y="74" textAnchor="middle" fontFamily="ui-monospace,monospace" fontSize="9" fill="var(--devdoc-muted)">readiness</text>
    </svg>
  );
}

export default function SharedReport() {
  const { token } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["shared", token],
    queryFn: () => apiRequest(`/api/shared/${encodeURIComponent(token)}`),
    retry: false,
  });

  const pageStyle = {
    backgroundColor: "var(--devdoc-bg)",
    backgroundImage: "linear-gradient(var(--devdoc-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--devdoc-grid-line) 1px, transparent 1px)",
    backgroundSize: "24px 24px",
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center" style={pageStyle}>
        <p className="font-mono text-sm text-[var(--devdoc-muted)]">Loading shared report…</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-[var(--devdoc-text)]" style={pageStyle}>
        <div className="max-w-md rounded-xl border p-8 text-center" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
          <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--devdoc-muted)]">Link expired</p>
          <h1 className="font-headline text-xl font-bold">This share link is no longer valid</h1>
          <p className="mt-2 text-sm text-[var(--devdoc-muted)]">Ask the project owner for a new link.</p>
        </div>
      </main>
    );
  }

  const { project, latestRun, options = {}, links = [] } = data;
  const results = latestRun?.results || [];
  const grouped = SEVERITY_ORDER.map((sev) => ({ sev, items: results.filter((r) => r.severity === sev) })).filter((g) => g.items.length > 0);
  const counts = SEVERITY_ORDER.reduce((acc, s) => ({ ...acc, [s]: results.filter((r) => r.severity === s).length }), {});

  const artifactCounts = [
    ["Objectives", options.businessObjectives?.length], ["Use cases", options.useCases?.length],
    ["Requirements", options.requirements?.length], ["Design elements", options.designElements?.length],
    ["Test cases", options.testCases?.length], ["Links", links.length],
  ];

  return (
    <main className="min-h-screen text-[var(--devdoc-text)]" style={pageStyle}>
      {/* public header */}
      <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
        <span className="font-headline text-lg font-bold">devdoc</span>
        <span className="font-mono text-[11px] tracking-[0.15em] text-[var(--devdoc-muted)]">READ-ONLY · SHARED REPORT</span>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-10">
        {/* project header */}
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--devdoc-highlight)]">Shared project</p>
        <h1 className="mt-1.5 font-headline text-3xl font-bold tracking-tight">{project?.name}</h1>
        {project?.description && <p className="mt-2 text-sm text-[var(--devdoc-muted)]">{project.description}</p>}

        {/* readiness + severity */}
        <section className="mt-8 grid grid-cols-1 gap-6 rounded-lg border p-6 sm:grid-cols-[auto_1fr]"
          style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
          <div className="flex items-center justify-center"><Gauge score={latestRun?.readinessScore ?? null} /></div>
          <div className="flex flex-col justify-center gap-3">
            {SEVERITY_ORDER.map((s) => (
              <div key={s} className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SEVERITY[s].color }} />
                <span className="flex-1 text-sm text-[var(--devdoc-muted)]">{SEVERITY[s].label}</span>
                <span className="font-headline text-lg font-semibold" style={{ color: SEVERITY[s].color }}>{counts[s]}</span>
              </div>
            ))}
          </div>
        </section>

        {/* artifact counts */}
        <section className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {artifactCounts.map(([label, n]) => (
            <div key={label} className="rounded-lg border p-3 text-center" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
              <p className="font-headline text-xl font-semibold">{n ?? 0}</p>
              <p className="text-[11px] text-[var(--devdoc-muted)]">{label}</p>
            </div>
          ))}
        </section>

        {/* findings */}
        <section className="mt-8">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--devdoc-muted)]">Validation findings</p>
          {grouped.length === 0 ? (
            <div className="rounded-lg border p-8 text-center" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
              <p className="text-sm text-[var(--devdoc-success)]">No issues found.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
              {grouped.map((g) => (
                <div key={g.sev}>
                  <div className="border-t px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] first:border-t-0"
                    style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface-inset)", color: SEVERITY[g.sev].color }}>
                    {SEVERITY[g.sev].label} · {g.items.length}
                  </div>
                  {g.items.map((r, i) => (
                    <div key={r.id || i} className="flex items-start gap-3 border-t px-4 py-3" style={{ borderColor: "var(--devdoc-border)" }}>
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: SEVERITY[g.sev].color }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm">{r.message}</p>
                        {r.ruleCode && <p className="mt-0.5 font-mono text-[11px] text-[var(--devdoc-muted)]">{r.ruleCode}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </section>

        <p className="mt-10 text-center font-mono text-[11px] text-[var(--devdoc-subtle)]">Generated by DevDoc</p>
      </div>
    </main>
  );
}
