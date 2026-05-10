import { Link } from "react-router-dom";
import { useProject } from "../context/ProjectContext";

function ProjectDocumentsPlaceholder() {
  const { projectId, project } = useProject();

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-4xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold text-teal-700">{project.name}</p>
        <h1 className="mt-3 text-3xl font-bold">Documents</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Document library is coming soon.
          <br />
          For now, create documents from the Template Library and open them after creation.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            className="inline-flex rounded-md bg-indigo-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-800"
            to={`/projects/${projectId}/templates`}
          >
            Browse Templates
          </Link>
          <Link
            className="inline-flex rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 transition hover:bg-slate-50"
            to={`/projects/${projectId}`}
          >
            Back to Project Overview
          </Link>
        </div>
      </section>
    </main>
  );
}

export default ProjectDocumentsPlaceholder;
