import { Link } from "react-router-dom";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function getProjectInitial(name) {
  if (!name) return "P";
  return name.trim().charAt(0).toUpperCase();
}

function getProjectColor(name) {
  const colors = [
    "#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#14b8a6", "#3b82f6"
  ];
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) hash = (hash << 5) - hash + name.charCodeAt(i);
  return colors[Math.abs(hash) % colors.length];
}

function ProjectCard({ project, isRecent = false }) {
  const color = getProjectColor(project.name);
  const initial = getProjectInitial(project.name);

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
        isRecent ? "ring-1 ring-[var(--devdoc-primary)] ring-offset-1 ring-offset-[var(--devdoc-bg)]" : ""
      }`}
      style={{
        backgroundColor: "var(--devdoc-surface)",
        borderColor: "var(--devdoc-border)",
        boxShadow: "var(--devdoc-shadow-xs)",
      }}
    >
      {/* Top accent line */}
      <div className="h-0.5 w-full" style={{ backgroundColor: color }} />

      <div className="flex flex-1 flex-col p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-black text-white shadow-sm"
            style={{ backgroundColor: color }}
          >
            {initial}
          </div>
          <span
            className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
            style={{
              backgroundColor: "var(--devdoc-success-soft)",
              color: "var(--devdoc-success)",
            }}
          >
            Active
          </span>
        </div>

        {/* Title */}
        <h3
          className="font-headline mt-4 text-base font-extrabold leading-snug transition-colors group-hover:text-[var(--devdoc-primary)]"
          style={{ color: "var(--devdoc-text)" }}
        >
          {project.name}
        </h3>

        {/* Description */}
        <p
          className="mt-2 line-clamp-2 flex-1 text-sm leading-6"
          style={{ color: "var(--devdoc-muted)" }}
        >
          {project.description || "No description provided for this project."}
        </p>

        {/* Dates */}
        <div
          className="mt-4 grid grid-cols-2 gap-2 rounded-lg px-3 py-2.5 text-xs"
          style={{ backgroundColor: "var(--devdoc-surface-muted)" }}
        >
          <div>
            <span className="devdoc-label block">Created</span>
            <span className="mt-0.5 block font-semibold" style={{ color: "var(--devdoc-text-secondary)" }}>
              {formatDate(project.createdAt)}
            </span>
          </div>
          <div>
            <span className="devdoc-label block">Updated</span>
            <span className="mt-0.5 block font-semibold" style={{ color: "var(--devdoc-text-secondary)" }}>
              {formatDate(project.updatedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between border-t px-5 py-3"
        style={{ borderColor: "var(--devdoc-border)" }}
      >
        <Link
          className="flex items-center gap-1 text-sm font-bold transition-all hover:gap-1.5"
          style={{ color: "var(--devdoc-primary)" }}
          to={`/projects/${project.id}`}
        >
          Open workspace
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
          </svg>
        </Link>
        {isRecent && (
          <span
            className="text-[9px] font-bold uppercase tracking-widest"
            style={{ color: "var(--devdoc-primary)" }}
          >
            Recent
          </span>
        )}
      </div>
    </article>
  );
}

export default ProjectCard;
