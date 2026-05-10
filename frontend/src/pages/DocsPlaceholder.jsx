import { Link } from "react-router-dom";

const workflow = [
  ["1", "Create a project", "Give it a name and optional description."],
  ["2", "Browse templates", "Select a profile and document type."],
  ["3", "Create a document", "DevDoc copies the template structure into your project."],
  ["4", "Write sections", "Use the structured editor with guidance and examples."],
  ["5", "Create use cases and requirements", "Capture user goals and system requirements."],
  ["6", "Build traceability", "Link use cases to requirements and requirements to document sections."],
  ["7", "Run validation", "Get a readiness score and identify missing or unlinked content."],
];

const documentTypes = [
  ["SCOPE", "Scope", "Defines project goals, users, boundaries, deliverables, assumptions, and risks."],
  ["SRS", "Software Requirements Specification", "Defines what the system must do: functional and non-functional requirements."],
  ["SDS", "Software Design Specification", "Defines how the system will be architected and built."],
  ["STP", "Software Test Plan", "Defines how the system will be tested and verified."],
];

function DocsPlaceholder() {
  return (
    <main className="min-h-screen bg-[var(--devdoc-bg)] px-6 py-10 text-[var(--devdoc-text)]">
      <section className="mx-auto max-w-4xl">
        <Link className="text-sm font-bold text-[var(--devdoc-primary)] hover:underline" to="/dashboard">
          Back to dashboard
        </Link>

        <div className="mb-8 mt-4">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight">Documentation Guide</h1>
          <p className="mt-2 text-sm text-[var(--devdoc-muted)]">
            How DevDoc works and what each document type covers.
          </p>
        </div>

        <div className="devdoc-card-border mb-8 p-6">
          <h2 className="font-headline text-xl font-extrabold">Core workflow</h2>
          <div className="mt-5 grid gap-3">
            {workflow.map(([step, label, detail]) => (
              <div key={step} className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--devdoc-primary-soft)] text-xs font-extrabold text-[var(--devdoc-primary)]">
                  {step}
                </span>
                <div>
                  <p className="font-bold">{label}</p>
                  <p className="mt-0.5 text-sm leading-6 text-[var(--devdoc-muted)]">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <h2 className="mb-4 font-headline text-xl font-extrabold">Document types</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {documentTypes.map(([code, title, description]) => (
            <article key={code} className="devdoc-card-border p-5">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-[var(--devdoc-primary-soft)] px-3 py-1 text-xs font-extrabold text-[var(--devdoc-primary)]">{code}</span>
                <h3 className="font-headline font-extrabold">{title}</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--devdoc-muted)]">{description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default DocsPlaceholder;
