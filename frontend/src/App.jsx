function App() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-12">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal-700">
            Phase 0 Foundation
          </p>
          <h1 className="text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl">
            DevDoc
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-700">
            A clean starting point for a structured software documentation and
            project knowledge management platform.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Frontend</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">
              React + Vite
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Styling</p>
            <p className="mt-2 text-lg font-semibold text-teal-700">
              Tailwind CSS active
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">API URL</p>
            <p className="mt-2 break-all text-lg font-semibold text-slate-950">
              {apiUrl}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
