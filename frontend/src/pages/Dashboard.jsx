import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return projects;
    return projects.filter((p) =>
      `${p.name || ""} ${p.description || ""}`.toLowerCase().includes(query)
    );
  }, [projects, searchQuery]);

  const recentProjects = projects.slice(0, 5);

  return (
    <main
      className="min-h-screen devdoc-fade-in"
      style={{ backgroundColor: "var(--devdoc-bg)", color: "var(--devdoc-text)" }}
    >
      {/* Page header */}
      <div
        className="border-b px-6 py-5"
        style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="devdoc-label" style={{ color: "var(--devdoc-primary)" }}>Executive Overview</p>
            <h1 className="font-headline mt-1.5 text-2xl font-extrabold tracking-tight">
              Welcome back{user?.name ? `, ${user.name}` : ""}
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--devdoc-muted)" }}>
              {projects.length > 0
                ? `${projects.length} active project${projects.length === 1 ? "" : "s"} · DevDoc workspace`
                : "DevDoc workspace · No projects yet"}
            </p>
          </div>
          <button
            className="devdoc-gradient-button shrink-0 gap-1.5"
            type="button"
            onClick={() => setIsCreateFormOpen(true)}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
            New Project
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6">

        {/* Stats row */}
        <div className="mb-6 grid grid-cols-3 gap-3 sm:grid-cols-3 lg:max-w-sm">
          <div
            className="rounded-xl border p-4 text-center"
            style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
          >
            <p className="font-headline text-2xl font-extrabold" style={{ color: "var(--devdoc-text)" }}>
              {projects.length}
            </p>
            <p className="mt-1 text-xs font-semibold" style={{ color: "var(--devdoc-muted)" }}>Projects</p>
          </div>
          <div
            className="rounded-xl border p-4 text-center"
            style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
          >
            <p className="font-headline text-2xl font-extrabold" style={{ color: "var(--devdoc-success)" }}>
              {projects.length}
            </p>
            <p className="mt-1 text-xs font-semibold" style={{ color: "var(--devdoc-muted)" }}>Active</p>
          </div>
          <div
            className="rounded-xl border p-4 text-center"
            style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
          >
            <p className="font-headline text-2xl font-extrabold" style={{ color: "var(--devdoc-primary)" }}>0</p>
            <p className="mt-1 text-xs font-semibold" style={{ color: "var(--devdoc-muted)" }}>Alerts</p>
          </div>
        </div>

        {/* Search */}
        <div
          className="mb-6 flex items-center gap-3 rounded-xl border px-4 py-2.5"
          style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
        >
          <svg className="h-4 w-4 shrink-0" style={{ color: "var(--devdoc-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
          </svg>
          <input
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--devdoc-text)" }}
            placeholder="Search active projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="text-xs font-medium transition hover:opacity-70"
              style={{ color: "var(--devdoc-muted)" }}
              type="button"
              onClick={() => setSearchQuery("")}
            >
              Clear
            </button>
          )}
          <span className="shrink-0 text-xs font-semibold" style={{ color: "var(--devdoc-subtle)" }}>
            {filteredProjects.length}/{projects.length}
          </span>
        </div>

        {/* Create modal */}
        {isCreateFormOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">
            <div
              className="devdoc-scale-in max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border shadow-2xl"
              style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
            >
              <div
                className="flex items-start justify-between gap-4 border-b p-5"
                style={{ borderColor: "var(--devdoc-border)" }}
              >
                <div>
                  <p className="devdoc-label">New project</p>
                  <h2 className="font-headline mt-1 text-xl font-extrabold">Create new project</h2>
                  <p className="mt-1 text-sm" style={{ color: "var(--devdoc-muted)" }}>
                    Start with project basics. Template selection available after creation.
                  </p>
                </div>
                <button
                  className="devdoc-icon-button"
                  type="button"
                  onClick={() => setIsCreateFormOpen(false)}
                  aria-label="Close"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                  </svg>
                </button>
              </div>
              <div className="p-5">
                <CreateProjectForm
                  onCreated={handleProjectCreated}
                  onCancel={() => setIsCreateFormOpen(false)}
                />
              </div>
            </div>
          </div>
        ) : null}

        {/* Loading */}
        {isLoadingProjects ? <LoadingSpinner label="Loading projects..." /> : null}

        {/* Error */}
        {!isLoadingProjects && loadError ? (
          <div
            className="rounded-xl border p-6"
            style={{ borderColor: "rgba(220,38,38,0.25)", backgroundColor: "var(--devdoc-error-soft)" }}
          >
            <p className="text-sm font-medium" style={{ color: "var(--devdoc-error)" }}>{loadError}</p>
            <button className="devdoc-gradient-button mt-4" type="button" onClick={loadProjects}>
              Retry
            </button>
          </div>
        ) : null}

        {/* Empty state */}
        {!isLoadingProjects && !loadError && projects.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center rounded-2xl border py-20 text-center"
            style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
          >
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl border"
              style={{
                backgroundColor: "var(--devdoc-primary-soft)",
                borderColor: "var(--devdoc-border)",
                color: "var(--devdoc-primary)",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
                <path d="M3 7l9 6 9-6" />
              </svg>
            </div>
            <h2 className="font-headline mt-5 text-xl font-extrabold">Welcome to DevDoc</h2>
            <p className="mt-3 max-w-md text-sm leading-6" style={{ color: "var(--devdoc-muted)" }}>
              You have no projects yet. Create your first project to start managing documentation, requirements, and traceability.
            </p>
            <button
              className="devdoc-gradient-button mt-6 gap-1.5"
              type="button"
              onClick={() => setIsCreateFormOpen(true)}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
              </svg>
              Create first project
            </button>
          </div>
        ) : null}

        {/* Projects + Activity */}
        {!isLoadingProjects && !loadError && projects.length > 0 ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="devdoc-label">Active projects</p>
                  <h2 className="font-headline mt-1 text-lg font-extrabold">
                    {searchQuery ? `${filteredProjects.length} result${filteredProjects.length !== 1 ? "s" : ""}` : "Continue working"}
                  </h2>
                </div>
                {searchQuery && (
                  <button
                    className="text-xs font-bold transition hover:underline"
                    style={{ color: "var(--devdoc-primary)" }}
                    type="button"
                    onClick={() => setSearchQuery("")}
                  >
                    View all
                  </button>
                )}
              </div>

              {filteredProjects.length === 0 ? (
                <div
                  className="rounded-xl border p-8 text-center text-sm"
                  style={{ borderColor: "var(--devdoc-border)", color: "var(--devdoc-muted)" }}
                >
                  No projects match "{searchQuery}".
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredProjects.map((project, index) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      isRecent={index === 0 && !searchQuery}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Recent activity sidebar */}
            <aside
              className="h-fit overflow-hidden rounded-xl border"
              style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
            >
              <div
                className="border-b px-4 py-3"
                style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface-muted)" }}
              >
                <p className="devdoc-label">Recent activity</p>
                <h2 className="font-headline mt-1 text-sm font-extrabold">Project timeline</h2>
              </div>
              <div>
                {recentProjects.map((project, index) => (
                  <div
                    key={project.id}
                    className="flex gap-3 border-b p-4 last:border-b-0 transition-colors hover:bg-[var(--devdoc-surface-muted)]"
                    style={{ borderColor: "var(--devdoc-border)" }}
                  >
                    <span
                      className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
                      style={{
                        backgroundColor: index === 0 ? "var(--devdoc-primary)" : "var(--devdoc-border-strong)"
                      }}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold" style={{ color: "var(--devdoc-text)" }}>
                        {project.name}
                      </p>
                      <p className="mt-0.5 text-xs" style={{ color: "var(--devdoc-muted)" }}>
                        Updated {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : "recently"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        ) : null}
      </div>
    </main>
  );
}

export default Dashboard;
