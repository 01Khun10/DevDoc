import { useProject } from "../context/ProjectContext";

const COMING_SOON = [
  ["Rename project", "Change the project name and description."],
  ["Change profile", "Switch to a different documentation profile."],
  ["Archive project", "Mark the project as archived without deleting it."],
  ["Delete project", "Permanently remove the project and all associated data."],
  ["Team access", "Invite collaborators and manage access roles."],
  ["Export project", "Export all documents and traceability data."],
];

function ProjectSettingsPlaceholder() {
  const { project } = useProject();

  return (
    <main className="min-h-screen bg-[var(--devdoc-bg)] px-6 py-8 text-[var(--devdoc-text)]">
      <section className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="devdoc-label text-[var(--devdoc-primary)]">{project.name}</p>
          <h1 className="font-headline mt-2 text-4xl font-extrabold tracking-tight">Project Settings</h1>
          <p className="mt-2 text-sm text-[var(--devdoc-muted)]">
            Project metadata, profile, and access management.
          </p>
        </div>

        <div className="devdoc-card-border p-6">
          <h2 className="font-headline text-xl font-extrabold">Current project</h2>
          <dl className="mt-5 grid gap-4 text-sm">
            <div className="devdoc-inset">
              <dt className="devdoc-label">Project name</dt>
              <dd className="mt-1 font-bold">{project.name}</dd>
            </div>
            {project.profile ? (
              <div className="devdoc-inset">
                <dt className="devdoc-label">Profile</dt>
                <dd className="mt-1 font-bold">{project.profile.name}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div className="devdoc-card-border mt-6 p-6">
          <h2 className="font-headline text-xl font-extrabold">Settings - coming soon</h2>
          <p className="mt-2 text-sm text-[var(--devdoc-muted)]">These actions are not yet enabled.</p>
          <div className="mt-5 grid gap-3">
            {COMING_SOON.map(([label, detail]) => (
              <div key={label} className="flex items-center justify-between rounded-2xl border border-[var(--devdoc-border)] bg-[var(--devdoc-surface-muted)] px-4 py-3">
                <div>
                  <p className="text-sm font-bold">{label}</p>
                  <p className="mt-0.5 text-xs text-[var(--devdoc-muted)]">{detail}</p>
                </div>
                <span className="rounded-full bg-[var(--devdoc-surface)] px-2.5 py-1 text-xs font-bold text-[var(--devdoc-subtle)] ring-1 ring-[var(--devdoc-border)]">
                  Soon
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default ProjectSettingsPlaceholder;
