const ARTICLE = {
    eyebrow: "Core concepts",
    title: "Understanding traceability",
    sections: [
      { id: "what", heading: "What is traceability?", body: "Traceability is the ability to follow the life of a requirement in both directions — back to the business objective that motivated it, and forward to the design elements and test cases that implement and verify it. DevDoc models this as a chain: Business Objective → Use Case → Requirement → Design Element → Test Case." },
      { id: "why", heading: "Why it matters", body: "Without traceability, requirements become orphaned: nobody knows why they exist, whether they're implemented, or whether they're tested. When a requirement changes, you can't tell what else is affected. DevDoc surfaces these gaps automatically through the Doc-Linter." },
      { id: "how", heading: "Creating links", body: "Open the Traceability page and choose a relationship mode. Use the Grid to click cells on and off, the Builder for a guided two-step pick, or accept Suggestions that DevDoc proposes from shared vocabulary. Every link is drawn as a dimension line — the same way a blueprint annotates a measurement." },
      { id: "orphans", heading: "Finding orphans", body: "An orphan is an artifact with no links. The Graph and Map views flag orphans with a red marker, and the Doc-Linter raises a warning for each one so you can resolve them before your readiness score is finalized." },
    ],
};

const CALLOUT = { info: "var(--devdoc-primary)", tip: "var(--devdoc-success)", warning: "var(--devdoc-warning)" };

export default function Documentation() {
  const article = ARTICLE;

  return (
    <main className="min-h-screen text-[var(--devdoc-text)]" style={{ backgroundColor: "var(--devdoc-bg)" }}>
      <div className="mx-auto flex max-w-[1200px]">
        {/* article */}
        <article className="min-w-0 flex-1 px-6 py-8 md:px-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--devdoc-highlight)]">{article.eyebrow}</p>
          <h1 className="mt-1.5 font-headline text-3xl font-bold tracking-tight">{article.title}</h1>

          <div className="mt-6 flex flex-col gap-6">
            {article.sections.map((s) => (
              <section key={s.id} id={s.id}>
                <h2 className="mb-2 font-headline text-xl font-semibold">{s.heading}</h2>
                <p className="text-[15px] leading-relaxed text-[var(--devdoc-text-secondary)]">{s.body}</p>
              </section>
            ))}

            {/* example callout */}
            <div className="rounded-lg border-l-2 p-4" style={{ borderColor: CALLOUT.tip, backgroundColor: "var(--devdoc-surface)" }}>
              <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.1em]" style={{ color: CALLOUT.tip }}>Tip</p>
              <p className="text-sm text-[var(--devdoc-muted)]">Run validation after adding links — the readiness score updates immediately, and any remaining orphans are listed with quick jump-to actions.</p>
            </div>
          </div>

        </article>

        {/* on this page */}
        <aside className="hidden w-52 flex-shrink-0 p-6 xl:block">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--devdoc-muted)]">On this page</p>
          <ul className="flex flex-col gap-1.5 border-l pl-3 text-[13px]" style={{ borderColor: "var(--devdoc-border)" }}>
            {article.sections.map((s) => (
              <li key={s.id}><a href={`#${s.id}`} className="text-[var(--devdoc-muted)] transition-colors hover:text-[var(--devdoc-text)]">{s.heading}</a></li>
            ))}
          </ul>
        </aside>
      </div>
    </main>
  );
}
