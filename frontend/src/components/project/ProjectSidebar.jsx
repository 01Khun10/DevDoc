import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useProject } from "../../context/ProjectContext";
import { Tooltip } from "../ui";

const OverviewIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-[17px] w-[17px] shrink-0">
    <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const BusinessObjectivesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-[17px] w-[17px] shrink-0">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
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

const DesignElementsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-[17px] w-[17px] shrink-0">
    <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
  </svg>
);

const TestCasesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-[17px] w-[17px] shrink-0">
    <path d="M14.5 2v6.5L19 16a2 2 0 0 1-1.75 3H6.75A2 2 0 0 1 5 16l4.5-7.5V2" /><path d="M8.5 2h7" /><path d="M7 15h10" />
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

const CollapseIcon = ({ collapsed }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0">
    <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="3" x2="9" y2="21" />
    <path d={collapsed ? "M14 10l2 2-2 2" : "M17 10l-2 2 2 2"} />
  </svg>
);

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const navigationGroups = [
  {
    label: "Workspace",
    items: [
      { Icon: OverviewIcon, label: "Overview", path: "", exact: true },
      { Icon: BusinessObjectivesIcon, label: "Objectives", path: "business-objectives" },
    ],
  },
  {
    label: "Documents",
    items: [
      { Icon: DocumentsIcon, label: "Documents", path: "documents" },
      { Icon: TemplatesIcon, label: "Templates", path: "templates" },
      { Icon: DiagramsIcon, label: "Diagrams", path: "diagrams" },
    ],
  },
  {
    label: "Specification",
    items: [
      { Icon: UseCasesIcon, label: "Use Cases", path: "use-cases" },
      { Icon: RequirementsIcon, label: "Requirements", path: "requirements" },
      { Icon: DesignElementsIcon, label: "Design Elements", path: "design-elements" },
      { Icon: TestCasesIcon, label: "Test Cases", path: "test-cases" },
    ],
  },
  {
    label: "Quality",
    items: [
      { Icon: TraceabilityIcon, label: "Traceability", path: "traceability" },
      { Icon: ValidationIcon, label: "Validation", path: "validation" },
    ],
  },
  {
    label: "Project",
    items: [
      { Icon: AnalyticsIcon, label: "Analytics", path: "analytics" },
      { Icon: SettingsIcon, label: "Settings", path: "settings" },
    ],
  },
];

const COLLAPSE_KEY = "devdoc.sidebar.collapsed";

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === "true";
  } catch {
    return false;
  }
}

function NavItem({ to, exact, path, Icon, label, collapsed, onNavigate }) {
  const link = (
    <NavLink
      to={to}
      end={exact || !path}
      onClick={onNavigate}
      className={({ isActive }) =>
        `devdoc-focus-ring group relative flex h-9 items-center gap-2.5 rounded-md text-[13px] font-medium transition-colors duration-150 ${
          collapsed ? "justify-center px-0" : "px-2.5"
        } ${
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
              className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full"
              style={{ backgroundColor: "var(--devdoc-primary)" }}
            />
          )}
          <Icon />
          {collapsed ? null : <span className="truncate leading-none">{label}</span>}
        </>
      )}
    </NavLink>
  );

  // Collapsed rail is icon-only, so the label has to surface on hover.
  return collapsed ? (
    <Tooltip content={label} side="right">
      {link}
    </Tooltip>
  ) : (
    link
  );
}

function SidebarBody({ collapsed, onToggleCollapse, onNavigate }) {
  const { projectId, project } = useProject();

  return (
    <>
      <div
        className="flex items-center gap-2 border-b px-3 py-3"
        style={{ borderColor: "var(--devdoc-border)" }}
      >
        {collapsed ? null : (
          <div className="min-w-0 flex-1">
            <p className="devdoc-label mb-1.5">Workspace</p>
            <p
              className="truncate text-[13px] font-bold leading-snug"
              style={{ color: "var(--devdoc-text)" }}
              title={project?.name}
            >
              {project?.name || "Project"}
            </p>
          </div>
        )}
        {onToggleCollapse ? (
          <Tooltip content={collapsed ? "Expand sidebar" : "Collapse sidebar"} side="right">
            <button
              type="button"
              className="devdoc-icon-button devdoc-focus-ring h-8 w-8 shrink-0"
              onClick={onToggleCollapse}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
            >
              <CollapseIcon collapsed={collapsed} />
            </button>
          </Tooltip>
        ) : null}
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-2">
        {navigationGroups.map((group) => (
          <div key={group.label} className="mb-3 last:mb-0">
            {collapsed ? (
              <div className="mx-2 mb-2 h-px" style={{ backgroundColor: "var(--devdoc-border)" }} />
            ) : (
              <p className="devdoc-label px-2.5 pb-1.5">{group.label}</p>
            )}
            <div className="grid gap-0.5">
              {group.items.map((item) => (
                <NavItem
                  key={item.label}
                  {...item}
                  to={item.path ? `/projects/${projectId}/${item.path}` : `/projects/${projectId}`}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </>
  );
}

function ProjectSidebar() {
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, String(collapsed));
    } catch {
      // Private mode or blocked storage: collapse still works, just not across reloads.
    }
  }, [collapsed]);

  // The drawer overlays content, so it must not survive a navigation.
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKeyDown = (event) => event.key === "Escape" && setDrawerOpen(false);
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen]);

  return (
    <>
      {/* Mobile: hamburger bar. The sidebar itself is an overlay drawer below lg. */}
      <div
        className="flex items-center gap-2 border-b px-3 py-2 lg:hidden"
        style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-sidebar)" }}
      >
        <button
          type="button"
          className="devdoc-icon-button devdoc-focus-ring"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open project navigation"
          aria-expanded={drawerOpen}
        >
          <MenuIcon />
        </button>
        <span className="devdoc-label">Project menu</span>
      </div>

      {drawerOpen ? (
        <div
          className="fixed inset-0 lg:hidden"
          style={{ zIndex: "var(--devdoc-z-drawer)", backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 flex w-64 flex-col border-r transition-transform duration-200 ease-out lg:hidden ${
          drawerOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
        style={{
          zIndex: "var(--devdoc-z-drawer)",
          borderColor: "var(--devdoc-border)",
          backgroundColor: "var(--devdoc-sidebar)",
        }}
        aria-label="Project navigation"
        aria-hidden={!drawerOpen}
      >
        <div className="flex items-center justify-end px-3 py-2 lg:hidden">
          <button
            type="button"
            className="devdoc-icon-button devdoc-focus-ring"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close project navigation"
          >
            <CloseIcon />
          </button>
        </div>
        {/* Drawer is always expanded; collapsing only applies to the docked rail. */}
        <SidebarBody collapsed={false} onNavigate={() => setDrawerOpen(false)} />
      </aside>

      <aside
        className="hidden shrink-0 border-r transition-[width] duration-200 ease-out lg:sticky lg:top-[var(--devdoc-topbar-h)] lg:flex lg:h-[calc(100vh-var(--devdoc-topbar-h))] lg:flex-col"
        style={{
          width: collapsed ? "var(--devdoc-sidebar-w-collapsed)" : "var(--devdoc-sidebar-w)",
          borderColor: "var(--devdoc-border)",
          backgroundColor: "var(--devdoc-sidebar)",
        }}
        aria-label="Project navigation"
      >
        <SidebarBody collapsed={collapsed} onToggleCollapse={() => setCollapsed((value) => !value)} />
      </aside>
    </>
  );
}

export default ProjectSidebar;
