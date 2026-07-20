import { useMemo, useState } from "react";
import { Icon } from "../components/ui";


const NAV = [
  { group: "Getting started", items: ["Introduction", "Creating a project", "The workflow"] },
  { group: "Core concepts", items: ["Business objectives", "Use cases", "Requirements", "Design elements", "Test cases", "Traceability", "Doc-Linter", "Diagrams"] },
  { group: "Guides", items: ["Writing good requirements", "Linking artifacts", "Sharing a report"] },
  { group: "Reference", items: ["Keyboard shortcuts", "FAQ"] },
];

const ARTICLES = {
  "Traceability": {
    eyebrow: "Core concepts",
    title: "Understanding traceability",
    sections: [
      { id: "what", heading: "What is traceability?", body: "Traceability is the ability to follow the life of a requirement in both directions — back to the business objective that motivated it, and forward to the design elements and test cases that implement and verify it. DevDoc models this as a chain: Business Objective → Use Case → Requirement → Design Element → Test Case." },
      { id: "why", heading: "Why it matters", body: "Without traceability, requirements become orphaned: nobody knows why they exist, whether they're implemented, or whether they're tested. When a requirement changes, you can't tell what else is affected. DevDoc surfaces these gaps automatically through the Doc-Linter." },
      { id: "how", heading: "Creating links", body: "Open the Traceability page and choose a relationship mode. Use the Grid to click cells on and off, the Builder for a guided two-step pick, or accept Suggestions that DevDoc proposes from shared vocabulary. Every link is drawn as a dimension line — the same way a blueprint annotates a measurement." },
      { id: "orphans", heading: "Finding orphans", body: "An orphan is an artifact with no links. The Graph and Map views flag orphans with a red marker, and the Doc-Linter raises a warning for each one so you can resolve them before your readiness score is finalized." },
    ],
  },
};

const CALLOUT = { info: "var(--devdoc-primary)", tip: "var(--devdoc-success)", warning: "var(--devdoc-warning)" };

export default function Documentation() {
  const [active, setActive] = useState("Traceability");
  const [query, setQuery] = useState("");
  const article = ARTICLES[active] || ARTICLES["Traceability"];

  const filteredNav = useMemo(() => {
    if (!query.trim()) return NAV;
    const q = query.toLowerCase();
    return NAV.map((g) => ({ ...g, items: g.items.filter((i) => i.toLowerCase().includes(q)) })).filter((g) => g.items.length);
  }, [query]);

  return (
    <main className="min-h-screen text-[var(--devdoc-text)]" style={{ backgroundColor: "var(--devdoc-bg)" }}>
      <div className="mx-auto flex max-w-[1200px]">
        {/* left docs nav */}
        <aside className="hidden w-60 flex-shrink-0 border-r p-4 lg:block" style={{ borderColor: "var(--devdoc-border)" }}>
          <div className="relative mb-4">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-[var(--devdoc-muted)]"><Icon size={14}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></Icon></span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search docs…"
              className="w-full rounded-md border py-1.5 pl-8 pr-2 text-[13px] outline-none focus:border-[var(--devdoc-highlight)]"
              style={{ backgroundColor: "var(--devdoc-surface-inset)", borderColor: "var(--devdoc-border)", color: "var(--devdoc-text)" }} />
          </div>
          {filteredNav.map((g) => (
            <div key={g.group} className="mb-4">
              <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--devdoc-muted)]">{g.group}</p>
              <ul className="flex flex-col gap-0.5">
                {g.items.map((it) => (
                  <li key={it}>
                    <button onClick={() => setActive(it)}
                      className="w-full rounded px-2 py-1 text-left text-[13px] transition-colors"
                      style={active === it ? { backgroundColor: "var(--devdoc-primary-soft)", color: "var(--devdoc-primary)" } : { color: "var(--devdoc-text-secondary)" }}>
                      {it}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>

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

          <div className="mt-10 flex items-center justify-between border-t pt-4" style={{ borderColor: "var(--devdoc-border)" }}>
            <button className="text-sm text-[var(--devdoc-muted)] hover:text-[var(--devdoc-text)]">← Requirements</button>
            <button className="text-sm text-[var(--devdoc-primary)]">Doc-Linter →</button>
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
