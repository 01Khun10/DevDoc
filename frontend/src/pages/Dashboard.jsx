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
    <main className="min-h-screen bg-[#f8f9fa] px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-7xl">
        <div className="devdoc-card p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-indigo-700">
              Executive Overview
            </p>
            <h1 className="font-headline mt-2 text-4xl font-extrabold tracking-tight">
              Your Projects
            </h1>
            <div className="mt-3 text-sm leading-6 text-slate-600">
              <span className="font-medium text-slate-700">Signed in as</span>{" "}
              {user?.name ? `${user.name} ` : ""}
              <span className="break-all">{user?.email}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="devdoc-gradient-button"
              type="button"
              onClick={() => setIsCreateFormOpen((isOpen) => !isOpen)}
            >
              + New Project
            </button>
            <button
              className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
          </div>
        </div>

        {isCreateFormOpen ? <CreateProjectForm onCreated={handleProjectCreated} /> : null}

        <section className="mt-8">
          {isLoadingProjects ? (
            <div className="devdoc-card-border p-6 text-sm text-slate-600">
              Loading projects...
            </div>
          ) : null}

          {!isLoadingProjects && loadError ? (
            <div className="rounded-2xl bg-red-50 p-6 text-sm text-red-700 ring-1 ring-red-100">
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
            <div className="devdoc-card-border flex flex-col items-center justify-center p-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-700">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 className="mt-4 font-headline text-xl font-extrabold text-slate-950">Welcome to DevDoc</h2>
              <p className="mt-2 max-w-md text-sm text-slate-600">
                You don't have any projects yet. Create your first project to start managing documentation, requirements, and traceability.
              </p>
              <button
                className="devdoc-gradient-button mt-6"
                type="button"
                onClick={() => setIsCreateFormOpen(true)}
              >
                Create First Project
              </button>
            </div>
          ) : null}

          {!isLoadingProjects && !loadError && projects.length > 0 ? (
            <div className="grid gap-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="devdoc-card-border p-5">
                  <span className="devdoc-label">Total Projects</span>
                  <span className="mt-2 block font-headline text-3xl font-extrabold text-slate-950">{projects.length}</span>
                </div>
                <div className="devdoc-card-border p-5">
                  <span className="devdoc-label">Recently Updated</span>
                  <span className="mt-2 block truncate font-headline text-xl font-extrabold text-slate-950">
                    {projects[0].name}
                  </span>
                </div>
                <div className="devdoc-card-border p-5">
                  <span className="devdoc-label">Getting Started</span>
                  <span className="mt-2 block font-headline text-xl font-extrabold text-teal-700">In Progress</span>
                </div>
              </div>

              <div>
                <h2 className="mb-4 font-headline text-2xl font-extrabold text-slate-950">Continue Working</h2>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {projects.map((project, index) => (
                    <ProjectCard key={project.id} project={project} isRecent={index === 0} />
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </section>
    </main>
  );
}

export default Dashboard;
