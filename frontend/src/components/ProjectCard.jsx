import { Link } from "react-router-dom";

function formatDate(value) {
  if (!value) {
    return "Unknown";
  }

  return new Date(value).toLocaleDateString();
}

function ProjectCard({ project }) {
  return (
    <article className="devdoc-card-border group p-6 transition hover:bg-slate-50">
      <div className="flex h-full flex-col">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-sm font-black text-indigo-700">
              DD
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
              Active
            </span>
          </div>
          <h3 className="font-headline mt-5 text-xl font-extrabold text-slate-950">
            {project.name}
          </h3>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
            {project.description || "No description"}
          </p>

          <div className="mt-5 grid gap-3 text-sm text-slate-600">
            <div className="rounded-xl bg-slate-50 p-3">
              <span className="devdoc-label block">Profile</span>
              <span className="mt-1 block font-semibold text-slate-800">
                {project.profile?.name || "No profile selected"}
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <span className="devdoc-label block">Created</span>
              <span className="mt-1 block font-semibold text-slate-800">
                {formatDate(project.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <Link
          className="mt-6 inline-flex text-sm font-bold text-indigo-700 transition group-hover:translate-x-1"
          to={`/projects/${project.id}`}
        >
          Open project -&gt;
        </Link>
      </div>
    </article>
  );
}

export default ProjectCard;
