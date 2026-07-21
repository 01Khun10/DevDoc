import { useEffect, useState } from "react";
import { Icon } from "../components/ui";
import { useParams } from "react-router-dom";
import { useProject, useUpdateProject } from "../api/projects";


function Card({ title, children }) {
  return (
    <section className="rounded-lg border p-6" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
      <h2 className="mb-4 font-headline text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default function ProjectSettings() {
  const { id } = useParams();
  const { data: project } = useProject(id);
  const updateMutation = useUpdateProject(id);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (project) { setName(project.name || ""); setDescription(project.description || ""); }
  }, [project]);

  async function save() {
    await updateMutation.mutateAsync({ name, description });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const dirty = project && (name !== (project.name || "") || description !== (project.description || ""));

  return (
    <main className="min-h-screen text-[var(--devdoc-text)]" style={{ backgroundColor: "var(--devdoc-bg)" }}>
      <div className="border-b px-6 py-5" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--devdoc-primary)]">{project?.name || "Project"}</p>
        <h1 className="mt-1.5 font-headline text-2xl font-bold tracking-tight">Project settings</h1>
      </div>

      <div className="mx-auto flex max-w-3xl flex-col gap-5 px-6 py-6">
        <Card title="Project info">
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--devdoc-muted)]">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-[var(--devdoc-highlight)]"
                style={{ backgroundColor: "var(--devdoc-surface-inset)", borderColor: "var(--devdoc-border)", color: "var(--devdoc-text)" }} />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--devdoc-muted)]">Description</label>
              <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
                className="w-full resize-none rounded-md border px-3 py-2 text-sm outline-none focus:border-[var(--devdoc-highlight)]"
                style={{ backgroundColor: "var(--devdoc-surface-inset)", borderColor: "var(--devdoc-border)", color: "var(--devdoc-text)" }} />
            </div>
            {project?.profile && (
              <div>
                <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--devdoc-muted)]">Profile</label>
                <div className="flex items-center gap-2">
                  <span className="rounded border px-3 py-1.5 text-sm text-[var(--devdoc-muted)]" style={{ borderColor: "var(--devdoc-border)" }}>{project.profile.name || project.profile.code}</span>
                  <span className="text-[12px] text-[var(--devdoc-subtle)]">Can't change after creation</span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <button onClick={save} disabled={!dirty || updateMutation.isPending}
                className="rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50" style={{ backgroundColor: "var(--devdoc-primary)" }}>
                {updateMutation.isPending ? "Saving…" : "Save changes"}
              </button>
              {saved && <span className="flex items-center gap-1 text-[13px] text-[var(--devdoc-success)]"><Icon size={14}><path d="M20 6 9 17l-5-5" /></Icon> Saved</span>}
            </div>
          </div>
        </Card>

      </div>
    </main>
  );
}
