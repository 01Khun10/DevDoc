import { Link } from "react-router-dom";
import { useProject } from "../context/ProjectContext";
import { useProjectOverview } from "../api/projects";
import ActivityFeed from "../components/ActivityFeed";

function formatDateTime(value) {
  if (!value) return "Unknown";
  return new Date(value).toLocaleString(undefined, {
    month: "short", day: "numeric", year: "numeric"
  });
}

const TOOLS = [
  {
    color: "#6366f1",
    initials: "TP",
    title: "Templates",
    description: "Browse profiles and create documents from structured templates.",
    path: "templates",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
      </svg>
    ),
  },
  {
    color: "#8b5cf6",
    initials: "UC",
    title: "Use Cases",
    description: "Capture user goals and scenarios before mapping to requirements.",
    path: "use-cases",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      </svg>
    ),
  },
  {
    color: "#06b6d4",
    initials: "RQ",
    title: "Requirements",
    description: "Manage functional and non-functional requirements in a searchable registry.",
    path: "requirements",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    color: "#10b981",
    initials: "TR",
    title: "Traceability",
    description: "Link use cases to requirements and requirements to document sections.",
    path: "traceability",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  {
    color: "#f59e0b",
    initials: "VL",
    title: "Doc-Linter",
    description: "Run checks for missing content, unlinked requirements, and readiness score.",
    path: "validation",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    color: "#ec4899",
    initials: "DG",
    title: "Diagrams",
    description: "Generate PlantUML traceability trees from your documentation graph.",
    path: "diagrams",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <rect x="3" y="3" width="6" height="6" rx="1" /><rect x="15" y="3" width="6" height="6" rx="1" /><rect x="9" y="15" width="6" height="6" rx="1" /><path d="M6 9v3a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9" /><line x1="12" y1="12" x2="12" y2="15" />
      </svg>
    ),
  },
];

// 5-step readiness checklist, auto-checked from live project data.
function getChecklistSteps(counts) {
  return [
    { label: "Create a document from a template", path: "templates", done: counts.documents > 0 },
    { label: "Capture use cases", path: "use-cases", done: counts.useCases > 0 },
    { label: "Register requirements", path: "requirements", done: counts.requirements > 0 },
    { label: "Link artefacts in the traceability matrix", path: "traceability", done: counts.traceabilityLinks > 0 },
    { label: "Run Doc-Linter validation", path: "validation", done: counts.validationRuns > 0 }
  ];
}

function ReadinessChecklist({ projectId, counts }) {
  const steps = getChecklistSteps(counts);
  const doneCount = steps.filter((step) => step.done).length;

  return (
    <div
      className="mb-6 rounded-xl border p-5"
      style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="devdoc-label">Getting to readiness</p>
        <span className="text-xs font-bold" style={{ color: doneCount === steps.length ? "var(--devdoc-success)" : "var(--devdoc-muted)" }}>
          {doneCount}/{steps.length} complete
        </span>
      </div>
      <ol className="grid gap-2">
        {steps.map((step, index) => (
          <li key={step.path}>
            <Link
              className="flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-all hover:border-[var(--devdoc-primary)]"
              style={{
                borderColor: "var(--devdoc-border)",
                backgroundColor: step.done ? "var(--devdoc-success-soft)" : "var(--devdoc-surface-muted)"
              }}
              to={`/projects/${projectId}/${step.path}`}
            >
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{
                  backgroundColor: step.done ? "var(--devdoc-success)" : "var(--devdoc-surface)",
                  border: step.done ? "none" : "1px solid var(--devdoc-border)",
                  color: step.done ? "#ffffff" : "var(--devdoc-muted)"
                }}
              >
                {step.done ? (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>
              <span
                className="font-semibold"
                style={{ color: step.done ? "var(--devdoc-success)" : "var(--devdoc-text)" }}
              >
                {step.label}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ProjectWorkspace() {
  const { project } = useProject();
  const { data: overview } = useProjectOverview(project.id);

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
        <p className="devdoc-label" style={{ color: "var(--devdoc-primary)" }}>Project Overview</p>
        <h1 className="font-headline mt-1.5 text-2xl font-extrabold tracking-tight">{project.name}</h1>
        {project.description ? (
          <p className="mt-1 max-w-2xl text-sm leading-6" style={{ color: "var(--devdoc-muted)" }}>
            {project.description}
          </p>
        ) : null}
      </div>

      <div className="mx-auto max-w-5xl px-6 py-6">
        {/* Project metadata */}
        <div
          className="mb-6 grid grid-cols-2 gap-3 rounded-xl border p-4 sm:grid-cols-4"
          style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
        >
          <div>
            <p className="devdoc-label">Profile</p>
            <p className="mt-1 text-sm font-semibold" style={{ color: "var(--devdoc-text)" }}>
              {project.profile?.name || "No profile"}
            </p>
          </div>
          <div>
            <p className="devdoc-label">Status</p>
            <span
              className="mt-1 inline-block rounded-md px-2 py-0.5 text-xs font-bold"
              style={{
                backgroundColor: "var(--devdoc-success-soft)",
                color: "var(--devdoc-success)",
              }}
            >
              Active
            </span>
          </div>
          <div>
            <p className="devdoc-label">Created</p>
            <p className="mt-1 text-sm" style={{ color: "var(--devdoc-muted)" }}>
              {formatDateTime(project.createdAt)}
            </p>
          </div>
          <div>
            <p className="devdoc-label">Updated</p>
            <p className="mt-1 text-sm" style={{ color: "var(--devdoc-muted)" }}>
              {formatDateTime(project.updatedAt)}
            </p>
          </div>
        </div>

        {/* Readiness checklist */}
        {overview ? <ReadinessChecklist projectId={project.id} counts={overview.counts} /> : null}

        {/* Recent activity */}
        <section className="mb-6">
          <p className="devdoc-label mb-3">Recent activity</p>
          <ActivityFeed projectId={project.id} />
        </section>

        {/* Tools grid */}
        <div>
          <p className="devdoc-label mb-3">Project tools</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((tool) => (
              <Link
                key={tool.path}
                to={`/projects/${project.id}/${tool.path}`}
                className="group flex flex-col rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  borderColor: "var(--devdoc-border)",
                  backgroundColor: "var(--devdoc-surface)",
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: tool.color }}
                  >
                    {tool.icon}
                  </span>
                  <h3
                    className="font-headline font-extrabold transition-colors group-hover:text-[var(--devdoc-primary)]"
                  >
                    {tool.title}
                  </h3>
                </div>
                <p className="mt-3 flex-1 text-sm leading-6" style={{ color: "var(--devdoc-muted)" }}>
                  {tool.description}
                </p>
                <div
                  className="mt-4 flex items-center gap-1 text-xs font-bold transition-all group-hover:gap-1.5"
                  style={{ color: tool.color }}
                >
                  Open {tool.title}
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Documentation link hint */}
        {!project.profile && (
          <div
            className="mt-6 flex items-center gap-4 rounded-xl border border-dashed p-5"
            style={{ borderColor: "var(--devdoc-border)" }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: "var(--devdoc-primary-soft)", color: "var(--devdoc-primary)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: "var(--devdoc-text)" }}>
                No documentation profile selected
              </p>
              <p className="mt-0.5 text-xs" style={{ color: "var(--devdoc-muted)" }}>
                Visit Templates to choose a profile and generate your first document structure.
              </p>
            </div>
            <Link
              to={`/projects/${project.id}/templates`}
              className="devdoc-button-secondary shrink-0 text-sm"
            >
              Browse templates
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default ProjectWorkspace;
