import { useProject } from "../context/ProjectContext";
import { useEffect, useState, useCallback } from "react";
import { getProjectOverview } from "../services/projectService";

function ProjectAnalyticsPlaceholder() {
  const { projectId, project } = useProject();
  const [overview, setOverview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadOverview = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getProjectOverview(projectId);
      setOverview(data);
    } catch (err) {
      console.error("Failed to load project overview", err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  return (
    <main className="min-h-screen bg-[#f8f9fa] px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-4xl">
        <div className="devdoc-card-border bg-white p-8">
          <p className="text-sm font-semibold text-indigo-700">{project.name}</p>
          <h1 className="mt-3 font-headline text-3xl font-extrabold text-slate-950">Analytics</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Advanced analytics charts will come later. For now, here is a summary of your project's progress and traceability coverage.
          </p>
        </div>

        {!isLoading && overview && (
          <div className="mt-6 grid gap-6">
            <div className="devdoc-card-border p-6 bg-white">
              <h2 className="font-headline text-xl font-extrabold mb-4">Project Totals</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl bg-slate-50 p-4 text-center">
                  <span className="block text-3xl font-black text-slate-800">{overview.counts.documents}</span>
                  <span className="mt-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Documents</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 text-center">
                  <span className="block text-3xl font-black text-slate-800">{overview.counts.requirements}</span>
                  <span className="mt-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Requirements</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 text-center">
                  <span className="block text-3xl font-black text-slate-800">{overview.counts.useCases}</span>
                  <span className="mt-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Use Cases</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 text-center">
                  <span className="block text-3xl font-black text-slate-800">{overview.counts.traceabilityLinks}</span>
                  <span className="mt-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Traceability Links</span>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="devdoc-card-border p-6 bg-white">
                <h2 className="font-headline text-xl font-extrabold mb-4">Readiness</h2>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 flex flex-col items-center justify-center h-32">
                  {overview.latestValidation ? (
                    <>
                      <span className={`text-4xl font-black ${overview.latestValidation.readinessScore === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {overview.latestValidation.readinessScore}%
                      </span>
                      <span className="mt-2 text-sm font-semibold text-slate-500 uppercase tracking-widest">Latest Score</span>
                    </>
                  ) : (
                    <span className="text-sm font-medium text-slate-600">No validation run yet</span>
                  )}
                </div>
              </div>

              <div className="devdoc-card-border p-6 bg-white">
                <h2 className="font-headline text-xl font-extrabold mb-4">Coverage</h2>
                <div className="grid gap-4">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-700">Requirements</span>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{overview.counts.requirements} Total</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="text-sm font-medium text-slate-600">{overview.coverage.linkedRequirements} Linked</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <span className="text-sm font-medium text-slate-600">{overview.coverage.unlinkedRequirements} Unlinked</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-700">Use Cases</span>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{overview.counts.useCases} Total</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="text-sm font-medium text-slate-600">{overview.coverage.linkedUseCases} Linked</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <span className="text-sm font-medium text-slate-600">{overview.coverage.unlinkedUseCases} Unlinked</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {isLoading && (
          <div className="mt-6 devdoc-card-border p-8 text-center text-sm text-slate-500">
            Loading analytics data...
          </div>
        )}
      </section>
    </main>
  );
}

export default ProjectAnalyticsPlaceholder;
