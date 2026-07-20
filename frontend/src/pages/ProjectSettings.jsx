import { useEffect, useState } from "react";
import { Icon } from "../components/ui";
import { useParams } from "react-router-dom";
import { useProject, useUpdateProject } from "../api/projects";


function Card({ title, children, danger }) {
  return (
    <section className="rounded-lg border p-6" style={{ borderColor: danger ? "var(--devdoc-error)" : "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
      <h2 className="mb-4 font-headline text-lg font-semibold" style={danger ? { color: "var(--devdoc-error)" } : undefined}>{title}</h2>
      {children}
    </section>
  );
}

function Planned() {
  return <span className="rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ color: "var(--devdoc-warning)", backgroundColor: "var(--devdoc-warning-soft)" }}>planned</span>;
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

        <Card title="Share link">
          <div className="flex items-start gap-2">
            <p className="flex-1 text-sm text-[var(--devdoc-muted)]">
              Give supervisors read-only access to your validation report and traceability map.
            </p>
            <Planned />
          </div>
          <button disabled className="mt-3 cursor-not-allowed rounded-md border px-4 py-2 text-sm opacity-60" style={{ borderColor: "var(--devdoc-border)", color: "var(--devdoc-muted)" }}>
            Create share link
          </button>
          <p className="mt-2 font-mono text-[11px] text-[var(--devdoc-subtle)]">Needs a share-token endpoint — see the shared report page, which already reads /api/shared/:token.</p>
        </Card>

        <Card title="Danger zone" danger>
          <div className="flex items-start gap-2">
            <p className="flex-1 text-sm text-[var(--devdoc-muted)]">Permanently delete this project and all its artifacts. This cannot be undone.</p>
            <Planned />
          </div>
          <button disabled className="mt-3 cursor-not-allowed rounded-md border px-4 py-2 text-sm opacity-60" style={{ borderColor: "var(--devdoc-error)", color: "var(--devdoc-error)" }}>
            Delete project
          </button>
          <p className="mt-2 font-mono text-[11px] text-[var(--devdoc-subtle)]">Needs a delete-project endpoint + hook before wiring the typed-name confirmation.</p>
        </Card>
      </div>
    </main>
  );
}
