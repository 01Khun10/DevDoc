import { Link } from "react-router-dom";
import { useProject } from "../context/ProjectContext";

function ProjectDocumentsPlaceholder() {
  const { projectId, project } = useProject();

  return (
    <main className="min-h-screen bg-[var(--devdoc-bg)] px-6 py-8 text-[var(--devdoc-text)]">
      <section className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="devdoc-label text-[var(--devdoc-primary)]">{project.name}</p>
          <h1 className="font-headline mt-2 text-4xl font-extrabold tracking-tight">Documents</h1>
          <p className="mt-2 text-sm text-[var(--devdoc-muted)]">
            A full document library view is coming soon.
          </p>
        </div>

        <div className="devdoc-card-border p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--devdoc-border)] bg-[var(--devdoc-primary-soft)] text-[var(--devdoc-primary)]">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="font-headline text-xl font-extrabold text-[var(--devdoc-text)]">Document library coming soon</h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--devdoc-muted)]">
            For now, create documents from the Template Library and open them directly after creation.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              className="devdoc-gradient-button"
              to={`/projects/${projectId}/templates`}
            >
              Browse Templates
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ProjectDocumentsPlaceholder;
