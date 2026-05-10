import { Link } from "react-router-dom";

const faqs = [
  {
    q: "What is DevDoc?",
    a: "DevDoc helps software teams create structured documentation and keep project knowledge connected from use cases through requirements, traceability, and validation.",
  },
  {
    q: "What is Doc-Linter?",
    a: "Doc-Linter runs automated checks for missing documents, empty required sections, unlinked requirements, and incomplete traceability. It scores project readiness from 0 to 100.",
  },
  {
    q: "What is traceability?",
    a: "Traceability links use cases to requirements, and requirements to the document sections that describe or justify them.",
  },
  {
    q: "How do I create a document?",
    a: "Open a project, go to Templates, choose a profile and template, then create the document from the preview.",
  },
  {
    q: "What are use cases?",
    a: "Use cases capture user goals and scenarios before they are mapped to requirements.",
  },
  {
    q: "How does the Traceability Matrix work?",
    a: "Choose a relationship view, select a source item on the left, then click target items on the right to link or unlink them.",
  },
];

function HelpPlaceholder() {
  return (
    <main className="min-h-screen bg-[var(--devdoc-bg)] px-6 py-10 text-[var(--devdoc-text)]">
      <section className="mx-auto max-w-3xl">
        <Link className="text-sm font-bold text-[var(--devdoc-primary)] hover:underline" to="/dashboard">
          Back to dashboard
        </Link>

        <div className="mb-8 mt-4">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight">Help &amp; FAQ</h1>
          <p className="mt-2 text-sm text-[var(--devdoc-muted)]">Quick answers to common questions about DevDoc.</p>
        </div>

        <div className="grid gap-4">
          {faqs.map(({ q, a }) => (
            <article key={q} className="devdoc-card-border p-5">
              <h2 className="font-headline text-base font-extrabold">{q}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--devdoc-muted)]">{a}</p>
            </article>
          ))}
        </div>

        <div className="devdoc-card-border mt-8 p-6 text-center">
          <p className="text-sm font-bold">Still have questions?</p>
          <p className="mt-2 text-sm text-[var(--devdoc-muted)]">
            More detailed documentation is available in the{" "}
            <Link to="/docs" className="font-bold text-[var(--devdoc-primary)] hover:underline">
              DevDoc documentation guide
            </Link>.
          </p>
        </div>
      </section>
    </main>
  );
}

export default HelpPlaceholder;
