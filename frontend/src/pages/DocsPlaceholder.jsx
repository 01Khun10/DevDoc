import { Link } from "react-router-dom";

const documentNotes = [
  ["Scope", "Defines the project idea, goals, users, boundaries, deliverables, and risks."],
  ["SRS", "Defines what the system must do, including requirements and acceptance criteria."],
  ["SDS", "Defines how the system will be designed and built."],
  ["STP", "Defines how the system will be tested and reviewed."]
];

function DocsPlaceholder() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-4xl">
        <Link className="text-sm font-semibold text-teal-700 hover:text-teal-800" to="/dashboard">
          Back to dashboard
        </Link>
        <h1 className="mt-4 text-3xl font-bold">DevDoc Documentation Guide</h1>
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Milestone workflow</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Project -&gt; template -&gt; document -&gt; requirements -&gt; traceability -&gt;
            validation.
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {documentNotes.map(([title, description]) => (
            <article
              key={title}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default DocsPlaceholder;
