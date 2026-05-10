import { Link } from "react-router-dom";

function AboutPlaceholder() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <Link className="text-sm font-semibold text-teal-700 hover:text-teal-800" to="/dashboard">
          Back to dashboard
        </Link>
        <h1 className="mt-4 text-3xl font-bold">About DevDoc</h1>
        <p className="mt-5 text-sm leading-7 text-slate-600">
          DevDoc is a documentation consistency assistant for software projects. It helps create
          structured documents, requirements, traceability links, and validation checks.
        </p>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          The current milestone focuses on the core workflow: project setup, template-based
          documents, section editing, requirements, traceability, and basic Doc-Linter validation.
        </p>
      </section>
    </main>
  );
}

export default AboutPlaceholder;
