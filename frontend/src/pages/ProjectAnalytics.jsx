import { useProject } from "../context/ProjectContext";
import { useProjectOverview } from "../api/projects";
import { useValidationRuns } from "../api/validation";
import { ReadinessTrendChart } from "../components/ValidationCharts";
import { StatCard } from "../components/ui";

function RatioBar({ label, value, total, displayValue }) {
  const ratio = total > 0 ? value / total : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-semibold" style={{ color: "var(--devdoc-text)" }}>{label}</span>
        <span style={{ color: "var(--devdoc-muted)" }}>
          {displayValue || `${value}/${total} (${Math.round(ratio * 100)}%)`}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: "var(--devdoc-surface-muted)" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${ratio * 100}%`, backgroundColor: "var(--devdoc-primary)" }}
        />
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="devdoc-card-border p-6">
      <h2 className="font-headline mb-4 text-base font-extrabold">{title}</h2>
      {children}
    </div>
  );
}

function ProjectAnalytics() {
  const { projectId, project } = useProject();
  const { data: overview, isLoading: isLoadingOverview } = useProjectOverview(projectId);
  const { data: validationRuns = [], isLoading: isLoadingRuns } = useValidationRuns(projectId);

  const isLoading = isLoadingOverview || isLoadingRuns;
  const latestScore = overview?.latestValidation?.readinessScore ?? null;

  return (
    <main
      className="min-h-screen devdoc-fade-in"
      style={{ backgroundColor: "var(--devdoc-bg)", color: "var(--devdoc-text)" }}
    >
      <div
        className="border-b px-6 py-5"
        style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
      >
        <p className="devdoc-label" style={{ color: "var(--devdoc-primary)" }}>{project.name}</p>
        <h1 className="font-headline mt-1.5 text-2xl font-extrabold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm leading-6" style={{ color: "var(--devdoc-muted)" }}>
          Progress, coverage, and readiness across the whole project.
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-6">
        {isLoading ? (
          <div className="devdoc-card-border p-8 text-center text-sm" style={{ color: "var(--devdoc-muted)" }}>
            Loading analytics data...
          </div>
        ) : null}

        {!isLoading && overview ? (
          <div className="grid gap-6">
            {/* Artifact counts */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <StatCard label="Documents" value={overview.counts.documents} />
              <StatCard label="Use Cases" value={overview.counts.useCases} />
              <StatCard label="Requirements" value={overview.counts.requirements} />
              <StatCard label="Design Elements" value={overview.counts.designElements ?? 0} />
              <StatCard label="Test Cases" value={overview.counts.testCases ?? 0} />
              <StatCard label="Links" value={overview.counts.traceabilityLinks} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Readiness trend */}
              <Card title="Readiness trend">
                {latestScore !== null ? (
                  <p className="mb-3 text-sm" style={{ color: "var(--devdoc-muted)" }}>
                    Latest score:{" "}
                    <strong
                      style={{
                        color:
                          latestScore >= 80
                            ? "var(--devdoc-success)"
                            : latestScore >= 50
                              ? "var(--devdoc-warning)"
                              : "var(--devdoc-error)"
                      }}
                    >
                      {latestScore}/100
                    </strong>
                  </p>
                ) : (
                  <p className="mb-3 text-sm" style={{ color: "var(--devdoc-muted)" }}>No validation run yet.</p>
                )}
                <ReadinessTrendChart runs={validationRuns} heightClass="h-48" />
              </Card>

              {/* Coverage */}
              <Card title="Traceability coverage">
                <div className="grid gap-4">
                  <RatioBar
                    label="Requirements linked"
                    value={overview.coverage.linkedRequirements}
                    total={overview.counts.requirements}
                  />
                  <RatioBar
                    label="Use cases linked"
                    value={overview.coverage.linkedUseCases}
                    total={overview.counts.useCases}
                  />
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <StatCard
                    label="Unlinked requirements"
                    value={overview.coverage.unlinkedRequirements}
                    color={overview.coverage.unlinkedRequirements > 0 ? "var(--devdoc-warning)" : "var(--devdoc-success)"}
                  />
                  <StatCard
                    label="Unlinked use cases"
                    value={overview.coverage.unlinkedUseCases}
                    color={overview.coverage.unlinkedUseCases > 0 ? "var(--devdoc-warning)" : "var(--devdoc-success)"}
                  />
                </div>
              </Card>
            </div>

            {/* Per-document completion */}
            <Card title="Document completion">
              {overview.documents?.length ? (
                <div className="grid gap-4">
                  {overview.documents.map((document) => (
                    <RatioBar
                      key={document.id}
                      label={`${document.title} (${document.documentType})`}
                      value={document.completionPercent}
                      total={100}
                      displayValue={`${document.completionPercent}%`}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm" style={{ color: "var(--devdoc-muted)" }}>
                  No documents yet. Create one from a template to start tracking completion.
                </p>
              )}
            </Card>
          </div>
        ) : null}
      </div>
    </main>
  );
}

export default ProjectAnalytics;
