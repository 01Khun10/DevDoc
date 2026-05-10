import { Link } from "react-router-dom";

function formatDate(value) {
  if (!value) return "Unknown";
  return new Date(value).toLocaleDateString();
}

function ProjectCard({ project, isRecent = false }) {
  return (
    <article
      className={`devdoc-card-border group flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-md ${
        isRecent ? "ring-2 ring-[var(--devdoc-primary)]" : ""
      }`}
    >
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-xs font-black text-white"
            style={{ backgroundColor: "var(--devdoc-primary)" }}
          >
            DD
          </span>
          <span
            className="rounded-md border px-2.5 py-0.5 text-xs font-bold"
            style={{
              backgroundColor: "color-mix(in srgb, var(--devdoc-success) 14%, transparent)",
              borderColor: "color-mix(in srgb, var(--devdoc-success) 36%, var(--devdoc-border))",
              color: "var(--devdoc-success)",
            }}
          >
            Active
          </span>
        </div>

        <h3 className="font-headline mt-4 text-lg font-extrabold transition-colors group-hover:text-[var(--devdoc-primary)]">
          {project.name}
        </h3>

        <p className="devdoc-muted mt-2 line-clamp-3 flex-1 text-sm leading-6">
          {project.description || "No description provided."}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="devdoc-inset">
            <span className="devdoc-label block">Created</span>
            <span className="mt-1 block font-semibold text-[var(--devdoc-text)]">
              {formatDate(project.createdAt)}
            </span>
          </div>
          <div className="devdoc-inset">
            <span className="devdoc-label block">Updated</span>
            <span className="mt-1 block font-semibold text-[var(--devdoc-text)]">
              {formatDate(project.updatedAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-[var(--devdoc-border)] pt-4">
        <Link
          className="text-sm font-bold text-[var(--devdoc-primary)] transition hover:underline"
          to={`/projects/${project.id}`}
        >
          Open workspace -&gt;
        </Link>
        {isRecent && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--devdoc-subtle)]">
            Recent
          </span>
        )}
      </div>
    </article>
  );
}

export default ProjectCard;
