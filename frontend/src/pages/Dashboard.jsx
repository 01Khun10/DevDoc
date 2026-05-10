import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateProjectForm from "../components/CreateProjectForm";
import LoadingSpinner from "../components/LoadingSpinner";
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

  async function handleProjectCreated() {
    setIsCreateFormOpen(false);
    await loadProjects();
  }

  return (
    <main className="min-h-screen px-6 py-8" style={{ backgroundColor: "var(--devdoc-bg)", color: "var(--devdoc-text)" }}>
      <section className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="devdoc-label text-[var(--devdoc-primary)]">Dashboard</p>
            <h1 className="font-headline mt-2 text-4xl font-extrabold tracking-tight">Your Projects</h1>
            {user?.name || user?.email ? (
              <p className="devdoc-muted mt-2 text-sm">
                Signed in as{" "}
                <span className="font-semibold text-[var(--devdoc-text)]">
                  {user.name || user.email}
                </span>
              </p>
            ) : null}
          </div>
          <button
            className="devdoc-gradient-button self-start sm:self-auto"
            type="button"
            onClick={() => setIsCreateFormOpen((v) => !v)}
          >
            + New project
          </button>
        </div>

        {/* Create form */}
        {isCreateFormOpen ? <CreateProjectForm onCreated={handleProjectCreated} /> : null}

        {/* Project list */}
        <section className="mt-6">
          {isLoadingProjects ? (
            <LoadingSpinner label="Loading projects..." />
          ) : null}

          {!isLoadingProjects && loadError ? (
            <div className="devdoc-card-border p-6">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">{loadError}</p>
              <button
                className="devdoc-gradient-button mt-4"
                type="button"
                onClick={loadProjects}
              >
                Retry
              </button>
            </div>
          ) : null}

          {!isLoadingProjects && !loadError && projects.length === 0 ? (
            <div className="devdoc-card-border flex flex-col items-center justify-center p-14 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border text-[var(--devdoc-primary)]" style={{ backgroundColor: "var(--devdoc-primary-soft)", borderColor: "var(--devdoc-border)" }}>
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 className="font-headline mt-5 text-2xl font-extrabold text-[var(--devdoc-text)]">
                Welcome to DevDoc
              </h2>
              <p className="devdoc-muted mt-3 max-w-md text-sm leading-6">
                You don't have any projects yet. Create your first project to start managing documentation, requirements, and traceability.
              </p>
              <button
                className="devdoc-gradient-button mt-6"
                type="button"
                onClick={() => setIsCreateFormOpen(true)}
              >
                Create first project
              </button>
            </div>
          ) : null}

          {!isLoadingProjects && !loadError && projects.length > 0 ? (
            <div className="grid gap-6">
              {/* Quick stats */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="devdoc-card-border p-5">
                  <p className="devdoc-label">Total projects</p>
                  <p className="font-headline mt-2 text-3xl font-extrabold text-[var(--devdoc-text)]">
                    {projects.length}
                  </p>
                </div>
                <div className="devdoc-card-border p-5">
                  <p className="devdoc-label">Last active</p>
                  <p className="font-headline mt-2 truncate text-xl font-extrabold text-[var(--devdoc-text)]">
                    {projects[0].name}
                  </p>
                </div>
                <div className="devdoc-card-border p-5">
                  <p className="devdoc-label">Status</p>
                  <p className="font-headline mt-2 text-xl font-extrabold text-[var(--devdoc-primary)]">
                    In progress
                  </p>
                </div>
              </div>

              {/* Project cards */}
              <div>
                <h2 className="mb-4 font-headline text-2xl font-extrabold" style={{ color: "var(--devdoc-text)" }}>Continue working</h2>
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
