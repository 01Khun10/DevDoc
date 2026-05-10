import { Link } from "react-router-dom";

function ProjectErrorState({ onRetry }) {
  return (
    <main className="min-h-[calc(100vh-5rem)] bg-slate-50 px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">Could not load project</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          The project may not exist, you may not have access, or the backend may not be running.
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Check that the backend server is running.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
            type="button"
            onClick={onRetry}
          >
            Retry
          </button>
          <Link
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
            to="/dashboard"
          >
            Back to dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}

export default ProjectErrorState;
