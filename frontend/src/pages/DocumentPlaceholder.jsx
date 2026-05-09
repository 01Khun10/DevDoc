import { Link, useLocation, useParams } from "react-router-dom";

function Badge({ children, tone = "slate" }) {
  const classes =
    tone === "teal"
      ? "bg-teal-50 text-teal-700 ring-teal-100"
      : "bg-slate-100 text-slate-700 ring-slate-200";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${classes}`}>
      {children}
    </span>
  );
}

function DocumentPlaceholder() {
  const { projectId } = useParams();
  const location = useLocation();
  const document = location.state?.document;

  if (!document) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
        <section className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <Link
            className="text-sm font-semibold text-teal-700 hover:text-teal-800"
            to={`/projects/${projectId}`}
          >
            Back to project workspace
          </Link>
          <p className="mt-5 text-lg font-semibold text-slate-950">
            This document cannot be loaded yet. Document loading starts in the next phase.
          </p>
        </section>
      </main>
    );
  }

  const sections = document.sections || [];

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-5xl">
        <div className="border-b border-slate-200 pb-6">
          <Link
            className="text-sm font-semibold text-teal-700 hover:text-teal-800"
            to={`/projects/${projectId}`}
          >
            Back to project workspace
          </Link>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-950">{document.title}</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Structured editing starts in the next phase.
              </p>
            </div>
            <Badge>{document.documentType}</Badge>
          </div>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">Status</p>
            <p className="mt-2 text-lg font-bold text-slate-950">{document.status}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">Completion</p>
            <p className="mt-2 text-lg font-bold text-slate-950">
              {document.completionPercent}%
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">Template</p>
            <p className="mt-2 text-lg font-bold text-slate-950">{document.template?.name}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">Sections</p>
            <p className="mt-2 text-lg font-bold text-slate-950">{sections.length}</p>
          </div>
        </section>

        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Document sections</h2>
          <div className="mt-5 grid gap-4">
            {sections.map((section) => (
              <article
                key={`${section.sectionNumber}-${section.title}`}
                className="rounded-md border border-slate-200 bg-white p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Section {section.sectionNumber}
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-slate-950">
                      {section.title}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={section.isRequired ? "teal" : "slate"}>
                      {section.isRequired ? "Required" : "Optional"}
                    </Badge>
                    <Badge>{section.status}</Badge>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

export default DocumentPlaceholder;
