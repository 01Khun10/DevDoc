import { Link } from "react-router-dom";

const faqs = [
  [
    "What is DevDoc?",
    "DevDoc helps software teams create structured documentation and keep project knowledge connected."
  ],
  [
    "What is Doc-Linter?",
    "Doc-Linter runs basic checks for missing documents, empty required sections, unlinked requirements, and incomplete documents."
  ],
  [
    "What is traceability?",
    "Traceability links requirements to the document sections that describe or support them."
  ],
  [
    "How do I create a document?",
    "Open a project, browse templates, select a profile and template, then create the document from the preview."
  ]
];

function HelpPlaceholder() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-4xl">
        <Link className="text-sm font-semibold text-teal-700 hover:text-teal-800" to="/dashboard">
          Back to dashboard
        </Link>
        <h1 className="mt-4 text-3xl font-bold">Help &amp; FAQ</h1>
        <div className="mt-8 grid gap-4">
          {faqs.map(([question, answer]) => (
            <article
              key={question}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-slate-950">{question}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default HelpPlaceholder;
