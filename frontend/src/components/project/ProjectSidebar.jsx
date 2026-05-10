import { NavLink } from "react-router-dom";
import { useProject } from "../../context/ProjectContext";

const navigationItems = [
  ["OV", "Overview", ""],
  ["DO", "Documents", "documents"],
  ["TP", "Templates", "templates"],
  ["UC", "Use Cases", "use-cases"],
  ["RQ", "Requirements", "requirements"],
  ["TR", "Traceability", "traceability"],
  ["VL", "Validation", "validation"],
  ["DG", "Diagrams", "diagrams"],
  ["VR", "Versions", "versions"],
  ["AN", "Analytics", "analytics"],
  ["ST", "Settings", "settings"]
];

function ProjectSidebar() {
  const { projectId, project } = useProject();

  return (
    <aside className="border-b border-[var(--devdoc-border)] bg-[var(--devdoc-surface)] px-3 py-3 shadow-[var(--devdoc-shadow-soft)] lg:sticky lg:top-[64px] lg:h-[calc(100vh-64px)] lg:w-64 lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:shadow-none">
      <div className="hidden px-2 pb-4 pt-1 lg:block">
        <p className="devdoc-label">Project</p>
        <p className="font-headline mt-1 truncate text-sm font-extrabold" style={{ color: "var(--devdoc-text)" }}>
          {project?.name || "Project"}
        </p>
      </div>

      <nav className="flex gap-1.5 overflow-x-auto pb-1 lg:grid lg:gap-0.5 lg:overflow-visible lg:pb-0">
        {navigationItems.map(([initials, label, path]) => {
          const to = path ? `/projects/${projectId}/${path}` : `/projects/${projectId}`;

          return (
            <NavLink
              key={label}
              className={({ isActive }) =>
              `flex min-w-max items-center gap-2.5 rounded-xl border px-2.5 py-2 text-sm font-bold transition lg:min-w-0 ${
                isActive
                  ? "border-[var(--devdoc-primary)] bg-[var(--devdoc-primary-soft)] text-[var(--devdoc-primary)] shadow-sm"
                  : "border-transparent text-[var(--devdoc-muted)] hover:border-[var(--devdoc-border)] hover:bg-[var(--devdoc-surface-muted)] hover:text-[var(--devdoc-text)]"
              }`
            }
            end={!path}
            to={to}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-[var(--devdoc-border)] bg-[var(--devdoc-surface-inset)] text-[10px] font-extrabold text-[var(--devdoc-muted)]">
                {initials}
              </span>
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default ProjectSidebar;
