import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import TraceabilityGraph from "../components/TraceabilityGraph";
import ValidationResultCard from "../components/ValidationResultCard";
import apiRequest from "../services/api";

const severityOrder = ["ERROR", "WARNING", "INFO"];

function getScoreColor(score) {
  if (score >= 80) return "var(--devdoc-success)";
  if (score >= 50) return "var(--devdoc-warning)";
  return "var(--devdoc-error)";
}

// Public read-only report reached via a share token — no auth, no actions.
function SharedReport() {
  const { token } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["shared", token],
    queryFn: () => apiRequest(`/api/shared/${encodeURIComponent(token)}`),
    retry: false
  });

  if (isLoading) return <LoadingSpinner fullScreen label="Loading shared report..." />;

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6" style={{ backgroundColor: "var(--devdoc-bg)" }}>
        <div className="devdoc-card-border max-w-md p-8 text-center">
          <p className="font-headline text-xl font-extrabold" style={{ color: "var(--devdoc-text)" }}>
            Share link not found or expired
          </p>
          <p className="mt-2 text-sm" style={{ color: "var(--devdoc-muted)" }}>
            Ask the project owner for a new link.
          </p>
        </div>
      </main>
    );
  }

  const { project, latestRun, options, links } = data;
  const results = latestRun?.results || [];
  const groupedResults = severityOrder
    .map((severity) => ({
      severity,
      results: results.filter((result) => result.severity === severity)
    }))
    .filter((group) => group.results.length > 0);

  return (
    <main className="min-h-screen devdoc-fade-in" style={{ backgroundColor: "var(--devdoc-bg)", color: "var(--devdoc-text)" }}>
      <div
        className="border-b px-6 py-5"
        style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
      >
        <p className="devdoc-label" style={{ color: "var(--devdoc-primary)" }}>Shared read-only report</p>
        <div className="mt-1.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-headline text-2xl font-extrabold tracking-tight">{project.name}</h1>
            {project.description ? (
              <p className="mt-1 max-w-2xl text-sm leading-6" style={{ color: "var(--devdoc-muted)" }}>
                {project.description}
              </p>
            ) : null}
          </div>
          {latestRun?.readinessScore !== null && latestRun?.readinessScore !== undefined ? (
            <span
              className="font-headline shrink-0 text-4xl font-extrabold"
              style={{ color: getScoreColor(latestRun.readinessScore) }}
            >
              {latestRun.readinessScore}
              <span className="text-xl" style={{ color: "var(--devdoc-subtle)" }}>/100</span>
            </span>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-6">
        {!latestRun ? (
          <div
            className="mb-6 rounded-xl border border-dashed p-8 text-center text-sm"
            style={{ borderColor: "var(--devdoc-border)", color: "var(--devdoc-muted)" }}
          >
            No validation run has been completed for this project yet.
          </div>
        ) : null}

        {latestRun && groupedResults.length === 0 ? (
          <div
            className="mb-6 rounded-xl border p-8 text-center"
            style={{ borderColor: "rgba(22,163,74,0.25)", backgroundColor: "var(--devdoc-success-soft)" }}
          >
            <p className="font-headline text-lg font-extrabold" style={{ color: "var(--devdoc-success)" }}>
              All checks passed
            </p>
          </div>
        ) : null}

        {groupedResults.map((group) => (
          <section key={group.severity} className="mb-6">
            <h2
              className="mb-3 text-xs font-extrabold uppercase tracking-widest"
              style={{
                color:
                  group.severity === "ERROR" ? "var(--devdoc-error)" :
                  group.severity === "WARNING" ? "var(--devdoc-warning)" :
                  "var(--devdoc-info)"
              }}
            >
              {group.severity} · {group.results.length}
            </h2>
            <div className="grid gap-3">
              {group.results.map((result) => (
                <ValidationResultCard key={result.id} result={result} />
              ))}
            </div>
          </section>
        ))}

        <section>
          <h2 className="font-headline mb-3 text-lg font-extrabold">Traceability graph</h2>
          <TraceabilityGraph projectId={null} options={options} links={links} />
        </section>
      </div>
    </main>
  );
}

export default SharedReport;
