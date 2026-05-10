import { Link } from "react-router-dom";

function formatDate(value) {
  if (!value) {
    return "Unknown";
  }

  return new Date(value).toLocaleDateString();
}

function ProjectCard({ project, isRecent = false }) {
  return (
    <article className={`devdoc-card-border group flex flex-col p-6 transition hover:-translate-y-1 hover:shadow-md ${isRecent ? 'ring-2 ring-indigo-500 border-transparent' : ''}`}>
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-sm font-black text-indigo-700">
            DD
          </span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
            Active
          </span>
        </div>
        <h3 className="font-headline mt-5 text-xl font-extrabold text-slate-950 group-hover:text-indigo-700 transition-colors">
          {project.name}
        </h3>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-slate-600">
          {project.description || "No description provided."}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-600">
          <div className="rounded-xl bg-slate-50 p-3">
            <span className="devdoc-label block">Created</span>
            <span className="mt-1 block font-semibold text-slate-800">
              {formatDate(project.createdAt)}
            </span>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <span className="devdoc-label block">Updated</span>
            <span className="mt-1 block font-semibold text-slate-800">
              {formatDate(project.updatedAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-slate-100 pt-5 flex items-center justify-between">
        <div className="flex flex-col">
          <Link
            className="inline-flex text-sm font-bold text-indigo-700 transition group-hover:text-indigo-800"
            to={`/projects/${project.id}`}
          >
            Open workspace -&gt;
          </Link>
          {isRecent && <span className="text-[10px] uppercase tracking-wider text-slate-400 mt-1 font-semibold">Next: Check Mission Control</span>}
        </div>
      </div>
    </article>
  );
}

export default ProjectCard;
