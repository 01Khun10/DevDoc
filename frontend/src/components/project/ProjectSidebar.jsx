import { NavLink } from "react-router-dom";
import { useProject } from "../../context/ProjectContext";

const navigationItems = [
  ["OV", "Overview", ""],
  ["DO", "Documents", "documents"],
  ["TP", "Templates", "templates"],
  ["RQ", "Requirements", "requirements"],
  ["TR", "Traceability", "traceability"],
  ["VL", "Validation", "validation"],
  ["DG", "Diagrams", "diagrams"],
  ["VR", "Versions", "versions"],
  ["AN", "Analytics", "analytics"],
  ["ST", "Project Settings", "settings"]
];

function ProjectSidebar() {
  const { projectId, project } = useProject();

  return (
    <aside className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm lg:sticky lg:top-[73px] lg:h-[calc(100vh-73px)] lg:w-72 lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r">
      <div className="hidden px-2 pb-4 lg:block">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Project</p>
        <p className="mt-1 truncate text-sm font-bold text-slate-950">
          {project?.name || "Project"}
        </p>
      </div>

      <nav className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:gap-1 lg:overflow-visible lg:pb-0">
        {navigationItems.map(([initials, label, path]) => {
          const to = path ? `/projects/${projectId}/${path}` : `/projects/${projectId}`;

          return (
            <NavLink
              key={label}
              className={({ isActive }) =>
                `flex min-w-max items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition lg:min-w-0 ${
                  isActive
                    ? "bg-teal-50 text-teal-800 ring-1 ring-teal-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`
              }
              end={!path}
              to={to}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-slate-100 text-[11px] font-bold text-slate-600">
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
