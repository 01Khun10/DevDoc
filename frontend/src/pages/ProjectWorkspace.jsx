import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { getProject } from "../services/projectService";

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
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorType, setErrorType] = useState("");

  const loadProject = useCallback(async () => {
    setIsLoading(true);
    setErrorType("");

    try {
      const loadedProject = await getProject(id);
      setProject(loadedProject);
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

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              className="text-sm font-semibold text-teal-700 hover:text-teal-800"
              to="/dashboard"
            >
              Back to dashboard
            </Link>
            <h1 className="mt-3 text-3xl font-bold">{project.name}</h1>
          </div>
          <button
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
            type="button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Project summary</h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              {project.description || "No description"}
            </p>
          </section>

          <aside className="rounded-lg border border-slate-200 bg-white p-6 text-sm shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Details</h2>
            <dl className="mt-4 grid gap-4">
              <div>
                <dt className="font-medium text-slate-700">Profile</dt>
                <dd className="mt-1 text-slate-600">
                  {project.profile?.name || "No profile selected yet"}
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

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Project tools</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md border border-teal-200 bg-teal-50 p-4 text-sm text-slate-700">
              <h3 className="font-semibold text-slate-950">Documentation Templates</h3>
              <p className="mt-2 leading-6">
                Browse available documentation profiles and templates for this project.
              </p>
              <Link
                className="mt-4 inline-flex text-sm font-semibold text-teal-700 hover:text-teal-800"
                to={`/projects/${project.id}/templates`}
              >
                Browse Templates -&gt;
              </Link>
            </div>
            <div className="rounded-md border border-teal-200 bg-teal-50 p-4 text-sm text-slate-700">
              <h3 className="font-semibold text-slate-950">Requirements Registry</h3>
              <p className="mt-2 leading-6">
                Create and manage FR/NFR requirements for this project.
              </p>
              <Link
                className="mt-4 inline-flex text-sm font-semibold text-teal-700 hover:text-teal-800"
                to={`/projects/${project.id}/requirements`}
              >
                Open Requirements -&gt;
              </Link>
            </div>
            <div className="rounded-md border border-teal-200 bg-teal-50 p-4 text-sm text-slate-700">
              <h3 className="font-semibold text-slate-950">Traceability Matrix</h3>
              <p className="mt-2 leading-6">
                Link requirements to the document sections that describe them.
              </p>
              <Link
                className="mt-4 inline-flex text-sm font-semibold text-teal-700 hover:text-teal-800"
                to={`/projects/${project.id}/traceability`}
              >
                Open Traceability -&gt;
              </Link>
            </div>
            <div className="rounded-md border border-teal-200 bg-teal-50 p-4 text-sm text-slate-700">
              <h3 className="font-semibold text-slate-950">Doc-Linter Validation</h3>
              <p className="mt-2 leading-6">
                Run checks for document completeness, required sections, requirements, and
                traceability.
              </p>
              <Link
                className="mt-4 inline-flex text-sm font-semibold text-teal-700 hover:text-teal-800"
                to={`/projects/${project.id}/validation`}
              >
                Open Validation -&gt;
              </Link>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

export default ProjectWorkspace;
