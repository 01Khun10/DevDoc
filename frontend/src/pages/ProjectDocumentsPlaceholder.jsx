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
          Created documents can be opened from the template creation flow for now. A full document
          library and list view will be improved later.
        </p>
        <Link
          className="mt-6 inline-flex rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
          to={`/projects/${projectId}/templates`}
        >
          Browse Templates
        </Link>
      </section>
    </main>
  );
}

export default ProjectDocumentsPlaceholder;
