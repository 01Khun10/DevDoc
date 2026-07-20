import { useMemo } from "react";
import { Icon } from "../components/ui";
import { Link, useParams } from "react-router-dom";
import { useValidationRuns } from "../api/validation";

function scoreColor(s) {
  if (s == null) return "var(--devdoc-muted)";
  if (s >= 80) return "var(--devdoc-success)";
  if (s >= 50) return "var(--devdoc-warning)";
  return "var(--devdoc-error)";
}

export default function ProjectVersions() {
  const { id } = useParams();
  const { data: runs = [], isLoading } = useValidationRuns(id);

  const sorted = useMemo(() =>
    [...runs].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)), [runs]);

  return (
    <main className="min-h-screen text-[var(--devdoc-text)]" style={{ backgroundColor: "var(--devdoc-bg)" }}>
      <div className="border-b px-6 py-5" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--devdoc-primary)]">Versions</p>
        <h1 className="mt-1.5 font-headline text-2xl font-bold tracking-tight">Versions & history</h1>
        <p className="mt-1 text-sm text-[var(--devdoc-muted)]">Validation run history and project snapshots</p>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-6">
        {/* honest "coming soon" for full snapshots */}
        <div className="mb-6 rounded-lg border p-6" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)", backgroundImage: "linear-gradient(var(--devdoc-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--devdoc-grid-line) 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
          <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--devdoc-highlight)]">Coming soon</p>
          <h2 className="font-headline text-lg font-semibold">Full version snapshots are on the way</h2>
          <p className="mt-2 max-w-xl text-sm text-[var(--devdoc-muted)]">
            For now, every validation run records a readiness score — your project's history is captured below.
            Explore trends in Analytics or run a fresh check in Validation.
          </p>
          <div className="mt-4 flex gap-2">
            <Link to={`/projects/${id}/analytics`} className="rounded-md border px-3 py-1.5 text-sm" style={{ borderColor: "var(--devdoc-border)", color: "var(--devdoc-text-secondary)" }}>View analytics</Link>
            <Link to={`/projects/${id}/validation`} className="rounded-md px-3 py-1.5 text-sm font-medium text-white" style={{ backgroundColor: "var(--devdoc-primary)" }}>Run validation</Link>
          </div>
        </div>

        {/* run history */}
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--devdoc-muted)]">Validation history</p>
        <div className="overflow-hidden rounded-lg border" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-t px-4 py-3 first:border-t-0" style={{ borderColor: "var(--devdoc-border)" }}>
                <div className="devdoc-skeleton h-4 w-32 rounded" /><div className="devdoc-skeleton ml-auto h-6 w-12 rounded" />
              </div>
            ))
          ) : sorted.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-12 text-center">
              <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--devdoc-muted)]">No runs yet</p>
              <p className="text-sm text-[var(--devdoc-muted)]">Run validation to start building history.</p>
            </div>
          ) : (
            sorted.map((run, i) => (
              <div key={run.id || i} className="flex items-center gap-4 border-t px-4 py-3 first:border-t-0" style={{ borderColor: "var(--devdoc-border)" }}>
                <span className="flex h-8 w-8 items-center justify-center rounded-full border" style={{ borderColor: "var(--devdoc-border)", color: "var(--devdoc-muted)" }}>
                  <Icon size={14}><path d="M12 8v4l3 3M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" /></Icon>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[13px]">{run.createdAt ? new Date(run.createdAt).toLocaleString() : "—"}</p>
                  <p className="text-[12px] text-[var(--devdoc-muted)]">
                    {run.errorCount ?? 0} error{run.errorCount === 1 ? "" : "s"} · {run.warningCount ?? 0} warning{run.warningCount === 1 ? "" : "s"}
                    {i === 0 && <span className="ml-2 rounded px-1.5 py-0.5 text-[10px]" style={{ color: "var(--devdoc-highlight)", backgroundColor: "var(--devdoc-highlight-soft)" }}>latest</span>}
                  </p>
                </div>
                {run.readinessScore != null && (
                  <span className="font-headline text-xl font-semibold" style={{ color: scoreColor(run.readinessScore) }}>{run.readinessScore}</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
