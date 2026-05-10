import { useProject } from "../context/ProjectContext";

function ProjectSettingsPlaceholder() {
  const { project } = useProject();

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-4xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold text-teal-700">{project.name}</p>
        <h1 className="mt-3 text-3xl font-bold">Project Settings</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Project metadata and documentation profile settings will be expanded here in a future UX
          pass. Update forms are intentionally not enabled in this batch.
        </p>
      </section>
    </main>
  );
}

export default ProjectSettingsPlaceholder;
