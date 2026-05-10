import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import useAuth from "../hooks/useAuth";
import { getProject } from "../services/projectService";

function formatDateTime(value) {
  if (!value) return "Unknown";
  return new Date(value).toLocaleString();
}

const TOOLS = [
  {
    initials: "TP",
    title: "Templates",
    description: "Browse profiles and create documents from structured templates.",
    path: "templates"
  },
  {
    initials: "UC",
    title: "Use Cases",
    description: "Capture user goals and scenarios before mapping to requirements.",
    path: "use-cases"
  },
  {
    initials: "RQ",
    title: "Requirements",
    description: "Manage functional and non-functional requirements in a registry.",
    path: "requirements"
  },
  {
    initials: "TR",
    title: "Traceability",
    description: "Link use cases to requirements and requirements to document sections.",
    path: "traceability"
  },
  {
    initials: "VL",
    title: "Doc-Linter",
    description: "Run checks for missing content, unlinked requirements, and readiness.",
    path: "validation"
  },
  {
    initials: "DG",
    title: "Diagrams",
    description: "Generate PlantUML traceability trees from your documentation graph.",
    path: "diagrams"
  }
];

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
      setErrorType(error.status === 404 ? "not-found" : "load-error");
    } finally {
      setIsLoading(false);
    }
  }, [id, logout, navigate]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  if (isLoading) return <LoadingSpinner fullScreen label="Loading project..." />;

  if (errorType === "not-found") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--devdoc-bg)] px-6">
        <div className="devdoc-card-border max-w-md p-8 text-center">
          <p className="font-headline text-xl font-extrabold" style={{ color: "var(--devdoc-text)" }}>Project not found</p>
          <button className="devdoc-gradient-button mt-6" onClick={() => navigate("/dashboard")}>
            Back to dashboard
          </button>
        </div>
      </main>
    );
  }

  if (errorType === "load-error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--devdoc-bg)] px-6">
        <div className="devdoc-card-border max-w-md p-8 text-center">
          <p className="font-headline text-xl font-extrabold" style={{ color: "var(--devdoc-text)" }}>Could not load project</p>
          <p className="mt-2 text-sm" style={{ color: "var(--devdoc-muted)" }}>Check your connection and try again.</p>
          <button className="devdoc-gradient-button mt-6" onClick={loadProject}>Retry</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--devdoc-bg)] px-6 py-8 text-[var(--devdoc-text)]">
      <section className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <p className="devdoc-label text-[var(--devdoc-primary)]">Project Overview</p>
          <h1 className="font-headline mt-2 text-4xl font-extrabold tracking-tight">{project.name}</h1>
          {project.description ? (
            <p className="devdoc-muted mt-3 max-w-2xl text-sm leading-6">
              {project.description}
            </p>
          ) : null}
        </div>

        {/* Summary + details */}
        <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_260px]">
          <div className="devdoc-card-border p-6">
            <h2 className="font-headline text-lg font-extrabold">Summary</h2>
            <p className="devdoc-muted mt-3 text-sm leading-6">
              {project.description || "No description provided for this project."}
            </p>
          </div>

          <div className="devdoc-card-border p-6 text-sm">
            <h2 className="font-headline text-base font-extrabold">Details</h2>
            <dl className="mt-4 grid gap-4">
              <div>
                <dt className="devdoc-label">Profile</dt>
                <dd className="mt-1 font-medium text-[var(--devdoc-text)]">
                  {project.profile?.name || "No profile selected"}
                </dd>
              </div>
              <div>
                <dt className="devdoc-label">Created</dt>
                <dd className="devdoc-muted mt-1">{formatDateTime(project.createdAt)}</dd>
              </div>
              <div>
                <dt className="devdoc-label">Updated</dt>
                <dd className="devdoc-muted mt-1">{formatDateTime(project.updatedAt)}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Tools grid */}
        <section>
          <h2 className="mb-4 font-headline text-xl font-extrabold">Project tools</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((tool) => (
              <Link
                key={tool.path}
                to={`/projects/${project.id}/${tool.path}`}
                className="devdoc-card-border group flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border text-sm font-extrabold"
                    style={{
                      backgroundColor: "var(--devdoc-primary-soft)",
                      borderColor: "var(--devdoc-border)",
                      color: "var(--devdoc-primary)",
                    }}
                  >
                    {tool.initials}
                  </span>
                  <h3 className="font-headline font-extrabold text-[var(--devdoc-text)]">
                    {tool.title}
                  </h3>
                </div>
                <p className="devdoc-muted mt-3 text-sm leading-6">{tool.description}</p>
                <span className="mt-4 text-xs font-bold text-[var(--devdoc-primary)] transition group-hover:translate-x-0.5">
                  Open -&gt;
                </span>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

export default ProjectWorkspace;
