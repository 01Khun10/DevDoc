import { Link } from "react-router-dom";

function formatDate(value) {
  if (!value) {
    return "Unknown";
  }

  return new Date(value).toLocaleDateString();
}

function ProjectCard({ project }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-full flex-col">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-950">{project.name}</h3>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
            {project.description || "No description"}
          </p>

          <div className="mt-5 grid gap-2 text-sm text-slate-600">
            <p>
              <span className="font-medium text-slate-700">Profile:</span>{" "}
              {project.profile?.name || "No profile selected"}
            </p>
            <p>
              <span className="font-medium text-slate-700">Created:</span>{" "}
              {formatDate(project.createdAt)}
            </p>
          </div>
        </div>

        <Link
          className="mt-6 inline-flex text-sm font-semibold text-teal-700 hover:text-teal-800"
          to={`/projects/${project.id}`}
        >
          Open project →
        </Link>
      </div>
    </article>
  );
}

export default ProjectCard;
