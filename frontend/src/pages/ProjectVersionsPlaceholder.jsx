import { useProject } from "../context/ProjectContext";

function ProjectVersionsPlaceholder() {
  const { project } = useProject();

  return (
    <main className="min-h-screen bg-[var(--devdoc-bg)] px-6 py-8 text-[var(--devdoc-text)]">
      <section className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="devdoc-label text-[var(--devdoc-primary)]">{project.name}</p>
          <h1 className="font-headline mt-2 text-4xl font-extrabold tracking-tight">Versions</h1>
          <p className="mt-2 text-sm text-[var(--devdoc-muted)]">
            Snapshot and checkpoint management for your project documentation.
          </p>
        </div>

        <div className="devdoc-card-border p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--devdoc-border)] bg-[var(--devdoc-primary-soft)] text-[var(--devdoc-primary)]">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="font-headline text-xl font-extrabold text-[var(--devdoc-text)]">Coming soon</h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--devdoc-muted)]">
            Version snapshots and checkpoints will let you preserve review-ready states and compare changes over time.
          </p>
        </div>
      </section>
    </main>
  );
}

export default ProjectVersionsPlaceholder;
