import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { getProjectOverview } from "../services/projectService";

function formatDateTime(value) {
  if (!value) {
    return "Unknown";
  }

  return new Date(value).toLocaleString();
}

function ProjectWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [overview, setOverview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorType, setErrorType] = useState("");

  const loadProject = useCallback(async () => {
    setIsLoading(true);
    setErrorType("");

    try {
      const loadedOverview = await getProjectOverview(id);
      setOverview(loadedOverview);
    } catch (error) {
      if (error.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      if (error.status === 404) {
        setErrorType("not-found");
      } else {
        setErrorType("load-error");
      }
    } finally {
      setIsLoading(false);
    }
  }, [id, logout, navigate]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-slate-900">
        <p className="text-sm font-medium text-slate-600">Loading project...</p>
      </main>
    );
  }

  if (errorType === "not-found") {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
        <section className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-lg font-semibold text-slate-950">Project not found.</p>
          <Link
            className="mt-5 inline-flex text-sm font-semibold text-teal-700 hover:text-teal-800"
            to="/dashboard"
          >
            Back to dashboard
          </Link>
        </section>
      </main>
    );
  }

  if (errorType === "load-error") {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
        <section className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-lg font-semibold text-slate-950">
            Could not load project. Check your connection and try again.
          </p>
          <Link
            className="mt-5 inline-flex text-sm font-semibold text-teal-700 hover:text-teal-800"
            to="/dashboard"
          >
            Back to dashboard
          </Link>
        </section>
      </main>
    );
  }

  const project = overview?.project;

  function getRecommendedNextStep() {
    if (!overview) return null;
    
    if (overview.counts.documents === 0) return "Create your first document from a template.";
    if (overview.counts.requirements === 0) return "Add requirements.";
    if (overview.counts.useCases === 0) return "Add use cases.";
    if (overview.coverage.unlinkedRequirements > 0 || overview.coverage.unlinkedUseCases > 0) return "Complete traceability links.";
    if (!overview.latestValidation) return "Run Doc-Linter validation.";
    if (overview.latestValidation.readinessScore < 100) return "Fix validation issues.";
    return "Project documentation is in good shape.";
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa] px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-6xl">
        <div className="devdoc-card p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link
                className="text-sm font-bold text-indigo-700 hover:text-indigo-800"
                to="/dashboard"
              >
                Back to dashboard
              </Link>
              <h1 className="font-headline mt-3 text-4xl font-extrabold tracking-tight">
                {project.name}
              </h1>
            </div>
            <button
              className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
          <section className="devdoc-card-border p-6 flex flex-col">
            <h2 className="font-headline text-2xl font-extrabold">Mission Control</h2>
            
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="devdoc-label">Recommended Next Step</span>
                <p className="mt-2 text-lg font-bold text-indigo-700">{getRecommendedNextStep()}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="devdoc-label">Latest Readiness Score</span>
                {overview.latestValidation ? (
                  <p className={`mt-2 text-3xl font-black ${overview.latestValidation.readinessScore === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {overview.latestValidation.readinessScore}%
                  </p>
                ) : (
                  <p className="mt-2 text-sm font-semibold text-slate-600">Run validation to calculate readiness.</p>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
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
                <span className="mt-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Links</span>
              </div>
            </div>
            
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Requirements Coverage</span>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-emerald-700">{overview.coverage.linkedRequirements} Linked</span>
                  <span className="text-sm font-bold text-amber-700">{overview.coverage.unlinkedRequirements} Unlinked</span>
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Use Cases Coverage</span>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-emerald-700">{overview.coverage.linkedUseCases} Linked</span>
                  <span className="text-sm font-bold text-amber-700">{overview.coverage.unlinkedUseCases} Unlinked</span>
                </div>
              </div>
            </div>
          </section>

          <aside className="devdoc-card-border p-6 text-sm">
            <h2 className="font-headline text-xl font-extrabold text-slate-950">Details</h2>
            <dl className="mt-4 grid gap-4">
              <div>
                <dt className="font-medium text-slate-700">Description</dt>
                <dd className="mt-1 text-slate-600 line-clamp-3">
                  {project.description || "No description provided."}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-slate-700">Created</dt>
                <dd className="mt-1 text-slate-600">{formatDateTime(project.createdAt)}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-700">Updated</dt>
                <dd className="mt-1 text-slate-600">{formatDateTime(project.updatedAt)}</dd>
              </div>
            </dl>
          </aside>
        </div>

        <section className="devdoc-card-border mt-6 p-6">
          <h2 className="font-headline text-xl font-extrabold">Quick Actions</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <Link
              to={`/projects/${project.id}/templates`}
              className="flex flex-col justify-center rounded-2xl bg-indigo-50 p-5 text-center text-sm font-bold text-indigo-700 transition hover:-translate-y-1 hover:shadow-md"
            >
              Browse Templates
            </Link>
            <Link
              to={`/projects/${project.id}/documents`}
              className="flex flex-col justify-center rounded-2xl bg-blue-50 p-5 text-center text-sm font-bold text-blue-700 transition hover:-translate-y-1 hover:shadow-md"
            >
              Open Documents
            </Link>
            <Link
              to={`/projects/${project.id}/use-cases`}
              className="flex flex-col justify-center rounded-2xl bg-violet-50 p-5 text-center text-sm font-bold text-violet-700 transition hover:-translate-y-1 hover:shadow-md"
            >
              Use Cases
            </Link>
            <Link
              to={`/projects/${project.id}/requirements`}
              className="flex flex-col justify-center rounded-2xl bg-emerald-50 p-5 text-center text-sm font-bold text-emerald-700 transition hover:-translate-y-1 hover:shadow-md"
            >
              Requirements
            </Link>
            <Link
              to={`/projects/${project.id}/traceability`}
              className="flex flex-col justify-center rounded-2xl bg-amber-50 p-5 text-center text-sm font-bold text-amber-700 transition hover:-translate-y-1 hover:shadow-md"
            >
              Traceability
            </Link>
            <Link
              to={`/projects/${project.id}/validation`}
              className="flex flex-col justify-center rounded-2xl bg-slate-100 p-5 text-center text-sm font-bold text-slate-700 transition hover:-translate-y-1 hover:shadow-md"
            >
              Validation
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}

export default ProjectWorkspace;
