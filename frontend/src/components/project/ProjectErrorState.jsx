import { Link } from "react-router-dom";

function ProjectErrorState({ onRetry }) {
  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[var(--devdoc-bg)] px-6 py-10 text-[var(--devdoc-text)]">
      <section className="devdoc-card-border mx-auto max-w-3xl p-8">
        <h1 className="font-headline text-2xl font-extrabold">Could not load project</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--devdoc-muted)]">
          The project may not exist, you may not have access, or the backend may not be running.
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--devdoc-muted)]">
          Check that the backend server is running.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="devdoc-gradient-button" type="button" onClick={onRetry}>
            Retry
          </button>
          <Link className="devdoc-button-secondary" to="/dashboard">
            Back to dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}

export default ProjectErrorState;
