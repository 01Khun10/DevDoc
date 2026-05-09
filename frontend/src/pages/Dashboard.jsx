import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateProjectForm from "../components/CreateProjectForm";
import ProjectCard from "../components/ProjectCard";
import useAuth from "../hooks/useAuth";
import { listProjects } from "../services/projectService";

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  const loadProjects = useCallback(async () => {
    setIsLoadingProjects(true);
    setLoadError("");

    try {
      const loadedProjects = await listProjects();
      setProjects(loadedProjects);
    } catch (error) {
      if (error.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      setLoadError("Could not load projects. Check your connection and try again.");
    } finally {
      setIsLoadingProjects(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  async function handleProjectCreated() {
    setIsCreateFormOpen(false);
    await loadProjects();
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
              DevDoc
            </p>
            <h1 className="mt-2 text-3xl font-bold">Your Projects</h1>
            <div className="mt-3 text-sm leading-6 text-slate-600">
              <span className="font-medium text-slate-700">Signed in as</span>{" "}
              {user?.name ? `${user.name} ` : ""}
              <span className="break-all">{user?.email}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
              type="button"
              onClick={() => setIsCreateFormOpen((isOpen) => !isOpen)}
            >
              + New Project
            </button>
            <button
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>

        {isCreateFormOpen ? <CreateProjectForm onCreated={handleProjectCreated} /> : null}

        <section className="mt-8">
          {isLoadingProjects ? (
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
              Loading projects...
            </div>
          ) : null}

          {!isLoadingProjects && loadError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              <p>{loadError}</p>
              <button
                className="mt-4 rounded-md bg-white px-4 py-2 text-sm font-semibold text-red-700 ring-1 ring-red-200 transition hover:bg-red-100"
                type="button"
                onClick={loadProjects}
              >
                Retry
              </button>
            </div>
          ) : null}

          {!isLoadingProjects && !loadError && projects.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
              You don't have any projects yet. Click + New Project above to get started.
            </div>
          ) : null}

          {!isLoadingProjects && !loadError && projects.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : null}
        </section>
      </section>
    </main>
  );
}

export default Dashboard;
