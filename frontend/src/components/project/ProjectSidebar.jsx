import { NavLink } from "react-router-dom";
import { useProject } from "../../context/ProjectContext";

const OverviewIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-[17px] w-[17px] shrink-0">
    <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const DocumentsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-[17px] w-[17px] shrink-0">
    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414A1 1 0 0 1 19 9.414V19a2 2 0 0 1-2 2z" />
  </svg>
);

const TemplatesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-[17px] w-[17px] shrink-0">
    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
  </svg>
);

const UseCasesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-[17px] w-[17px] shrink-0">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const RequirementsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-[17px] w-[17px] shrink-0">
    <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const TraceabilityIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-[17px] w-[17px] shrink-0">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const ValidationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-[17px] w-[17px] shrink-0">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const DiagramsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-[17px] w-[17px] shrink-0">
    <rect x="3" y="3" width="6" height="6" rx="1" /><rect x="15" y="3" width="6" height="6" rx="1" /><rect x="9" y="15" width="6" height="6" rx="1" /><path d="M6 9v3a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9" /><line x1="12" y1="12" x2="12" y2="15" />
  </svg>
);

const VersionsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-[17px] w-[17px] shrink-0">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-[17px] w-[17px] shrink-0">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-[17px] w-[17px] shrink-0">
    <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const navigationItems = [
  { Icon: OverviewIcon, label: "Overview", path: "", exact: true },
  { Icon: DocumentsIcon, label: "Documents", path: "documents" },
  { Icon: TemplatesIcon, label: "Templates", path: "templates" },
  { Icon: UseCasesIcon, label: "Use Cases", path: "use-cases" },
  { Icon: RequirementsIcon, label: "Requirements", path: "requirements" },
  { Icon: TraceabilityIcon, label: "Traceability", path: "traceability" },
  { Icon: ValidationIcon, label: "Validation", path: "validation" },
  { Icon: DiagramsIcon, label: "Diagrams", path: "diagrams" },
  { Icon: VersionsIcon, label: "Versions", path: "versions" },
  { Icon: AnalyticsIcon, label: "Analytics", path: "analytics" },
  { Icon: SettingsIcon, label: "Settings", path: "settings" },
];

function ProjectSidebar() {
  const { projectId, project } = useProject();

  return (
    <aside
      className="border-b lg:sticky lg:top-[52px] lg:h-[calc(100vh-52px)] lg:w-56 lg:shrink-0 lg:border-b-0 lg:border-r lg:flex lg:flex-col"
      style={{
        borderColor: "var(--devdoc-border)",
        backgroundColor: "var(--devdoc-sidebar)",
      }}
    >
      {/* Project header */}
      <div
        className="hidden border-b px-4 py-3 lg:block"
        style={{ borderColor: "var(--devdoc-border)" }}
      >
        <p className="devdoc-label mb-1.5">Workspace</p>
        <p
          className="truncate text-[13px] font-bold leading-snug"
          style={{ color: "var(--devdoc-text)" }}
          title={project?.name}
        >
          {project?.name || "Project"}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex gap-1 overflow-x-auto p-2 lg:grid lg:gap-0.5 lg:overflow-visible lg:flex-1 lg:overflow-y-auto">
        {navigationItems.map(({ Icon, label, path, exact }) => {
          const to = path ? `/projects/${projectId}/${path}` : `/projects/${projectId}`;

          return (
            <NavLink
              key={label}
              to={to}
              end={exact || !path}
              className={({ isActive }) =>
                `group relative flex min-w-max items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] font-medium transition-all duration-150 lg:min-w-0 ${
                  isActive
                    ? "bg-[var(--devdoc-primary-soft)] text-[var(--devdoc-primary)]"
                    : "text-[var(--devdoc-muted)] hover:bg-[var(--devdoc-surface-muted)] hover:text-[var(--devdoc-text-secondary)]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 hidden h-5 w-0.5 -translate-y-1/2 rounded-full lg:block"
                      style={{ backgroundColor: "var(--devdoc-primary)" }}
                    />
                  )}
                  <Icon />
                  <span className="leading-none">{label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default ProjectSidebar;
