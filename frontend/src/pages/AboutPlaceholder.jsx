import { Link } from "react-router-dom";

const highlights = [
  ["TPL", "Templates", "Three profiles and four document types provide a structured starting point."],
  ["DOC", "Document editor", "Section editing with guidance, examples, and status tracking."],
  ["REQ", "Requirements", "Functional and non-functional requirement registry with priority and status."],
  ["UC", "Use Cases", "Capture user goals before they become requirements."],
  ["TRC", "Traceability", "Link use cases, requirements, and document sections."],
  ["VAL", "Doc-Linter", "Automated checks with a readiness score."],
  ["DGM", "Diagrams", "PlantUML traceability tree generation from project data."],
];

function AboutPlaceholder() {
  return (
    <main className="min-h-screen bg-[var(--devdoc-bg)] px-6 py-10 text-[var(--devdoc-text)]">
      <section className="mx-auto max-w-3xl">
        <Link className="text-sm font-bold text-[var(--devdoc-primary)] hover:underline" to="/dashboard">
          Back to dashboard
        </Link>

        <div className="mb-8 mt-4">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight">About DevDoc</h1>
          <p className="mt-2 text-sm text-[var(--devdoc-muted)]">
            A documentation lifecycle assistant for software teams.
          </p>
        </div>

        <div className="devdoc-card-border mb-6 p-6">
          <h2 className="font-headline text-xl font-extrabold">What is DevDoc?</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--devdoc-muted)]">
            DevDoc helps software teams create structured documentation and keep project knowledge connected. It replaces loose free-text documents with section-by-section editing, templates, traceability, and validation checks.
          </p>
          <p className="mt-4 text-sm leading-7 text-[var(--devdoc-muted)]">
            The traceability system links use cases to requirements and requirements to the document sections that describe them, giving documentation a clear provenance.
          </p>
        </div>

        <div className="devdoc-card-border mb-6 p-6">
          <h2 className="font-headline text-xl font-extrabold">What's included</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {highlights.map(([code, label, detail]) => (
              <div key={label} className="devdoc-inset flex items-start gap-3">
                <span className="rounded-lg bg-[var(--devdoc-primary-soft)] px-2.5 py-1 text-xs font-black text-[var(--devdoc-primary)]">{code}</span>
                <div>
                  <p className="font-bold">{label}</p>
                  <p className="mt-0.5 text-xs leading-5 text-[var(--devdoc-muted)]">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="devdoc-card-border p-6">
          <h2 className="font-headline text-xl font-extrabold">Tech stack</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {["React", "Vite", "Tailwind CSS", "Node.js", "Express", "PostgreSQL", "Prisma", "JWT"].map((tech) => (
              <span key={tech} className="rounded-full bg-[var(--devdoc-surface-muted)] px-3 py-1 text-xs font-bold text-[var(--devdoc-muted)] ring-1 ring-[var(--devdoc-border)]">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default AboutPlaceholder;
