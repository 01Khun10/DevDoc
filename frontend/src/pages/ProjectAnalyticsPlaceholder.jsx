import { useProject } from "../context/ProjectContext";
import { useProjectOverview } from "../api/projects";

function MetricCard({ label, value }) {
  return (
    <div className="devdoc-inset text-center">
      <span className="block text-3xl font-black text-[var(--devdoc-text)]">{value}</span>
      <span className="devdoc-label mt-1 block">{label}</span>
    </div>
  );
}

function ProjectAnalyticsPlaceholder() {
  const { projectId, project } = useProject();
  const { data: overview, isLoading } = useProjectOverview(projectId);

  return (
    <main className="min-h-screen bg-[var(--devdoc-bg)] px-6 py-10 text-[var(--devdoc-text)]">
      <section className="mx-auto max-w-4xl">
        <div className="devdoc-card-border p-8">
          <p className="devdoc-label text-[var(--devdoc-primary)]">{project.name}</p>
          <h1 className="font-headline mt-3 text-3xl font-extrabold">Analytics</h1>
          <p className="mt-4 text-sm leading-7 text-[var(--devdoc-muted)]">
            Advanced analytics charts will come later. For now, this page summarizes progress and traceability coverage.
          </p>
        </div>

        {isLoading ? (
          <div className="devdoc-card-border mt-6 p-8 text-center text-sm text-[var(--devdoc-muted)]">
            Loading analytics data...
          </div>
        ) : null}

        {!isLoading && overview ? (
          <div className="mt-6 grid gap-6">
            <div className="devdoc-card-border p-6">
              <h2 className="font-headline mb-4 text-xl font-extrabold">Project Totals</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <MetricCard label="Documents" value={overview.counts.documents} />
                <MetricCard label="Requirements" value={overview.counts.requirements} />
                <MetricCard label="Use Cases" value={overview.counts.useCases} />
                <MetricCard label="Links" value={overview.counts.traceabilityLinks} />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="devdoc-card-border p-6">
                <h2 className="font-headline mb-4 text-xl font-extrabold">Readiness</h2>
                <div className="devdoc-inset flex h-32 flex-col items-center justify-center">
                  {overview.latestValidation ? (
                    <>
                      <span
                        className="text-4xl font-black"
                        style={{
                          color:
                            overview.latestValidation.readinessScore === 100
                              ? "var(--devdoc-success)"
                              : "var(--devdoc-warning)",
                        }}
                      >
                        {overview.latestValidation.readinessScore}%
                      </span>
                      <span className="devdoc-label mt-2">Latest Score</span>
                    </>
                  ) : (
                    <span className="text-sm font-medium text-[var(--devdoc-muted)]">No validation run yet</span>
                  )}
                </div>
              </div>

              <div className="devdoc-card-border p-6">
                <h2 className="font-headline mb-4 text-xl font-extrabold">Coverage</h2>
                <div className="grid gap-4">
                  {[
                    ["Requirements", overview.counts.requirements, overview.coverage.linkedRequirements, overview.coverage.unlinkedRequirements],
                    ["Use Cases", overview.counts.useCases, overview.coverage.linkedUseCases, overview.coverage.unlinkedUseCases],
                  ].map(([label, total, linked, unlinked]) => (
                    <div key={label} className="devdoc-inset">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-bold">{label}</span>
                        <span className="devdoc-label">{total} Total</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="text-sm font-medium text-[var(--devdoc-success)]">{linked} linked</span>
                        <span className="text-sm font-medium text-[var(--devdoc-warning)]">{unlinked} unlinked</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}

export default ProjectAnalyticsPlaceholder;
