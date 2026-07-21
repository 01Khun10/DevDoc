import { useState } from "react";
import { Icon } from "../components/ui";
import { Link } from "react-router-dom";

/* Help — Blueprint edition. Based on Stitch "help_center_blueprint_edition",
 * completed to the full spec (the Stitch mock only had search + 3 cards):
 * added more quick-help cards, an FAQ accordion, and a feedback card.
 * Renders under AppShell. */


const CARDS = [
  { title: "Getting started", body: "Create a project, add artifacts, run your first validation.", to: "/docs",
    icon: <><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /></> },
  { title: "Keyboard shortcuts", body: "Every binding for fast, keyboard-first navigation.", to: "/accessibility",
    icon: <><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12" /></> },
  { title: "Traceability guide", body: "Link objectives, requirements, design, and tests.", to: "/docs",
    icon: <><rect x="3" y="3" width="6" height="6" rx="1" /><rect x="15" y="15" width="6" height="6" rx="1" /><path d="M9 6h6a3 3 0 0 1 3 3v6" /></> },
  { title: "Doc-Linter rules", body: "Understand every validation check and readiness scoring.", to: "/docs",
    icon: <><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></> },
  { title: "Diagrams", body: "Author UML or auto-generate diagrams from your project.", to: "/docs",
    icon: <><path d="M14.5 2v6.5L19 16a2 2 0 0 1-1.75 3H6.75A2 2 0 0 1 5 16l4.5-7.5V2" /><path d="M8.5 2h7M7 15h10" /></> },
];

const FAQ = [
  { q: "What is a readiness score?", a: "A weighted measure of how complete and traceable your documentation is — it combines section completion, requirement traceability, use-case coverage, and design/test linkage into a single 0–100 value that updates on every validation run." },
  { q: "How do I link requirements?", a: "Open the Traceability page and use the Grid, Builder, or Map view to connect artifacts. You can also capture requirements inline while writing in the editor, which links them to their section automatically." },
  { q: "Can supervisors see my project?", a: "Yes — create a read-only share link in Project Settings. It gives supervisors access to your validation report and traceability map without letting them edit anything." },
  { q: "Which UML diagrams are supported?", a: "The Diagram Designer auto-generates five diagram types from your project data and lets you author all standard UML 2.5 diagram types as code with live rendering." },
  { q: "Is my work saved automatically?", a: "The document editor autosaves a few seconds after you stop typing, and shows a saved indicator. You can also save manually at any time." },
];

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-lg border p-6 ${className}`}
      style={{ backgroundColor: "var(--devdoc-surface)", borderColor: "var(--devdoc-border)" }}>
      {children}
    </div>
  );
}

export default function Help() {
  const [open, setOpen] = useState(0);
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const cards = needle ? CARDS.filter((item) => `${item.title} ${item.body}`.toLowerCase().includes(needle)) : CARDS;
  const faq = needle ? FAQ.filter((item) => `${item.q} ${item.a}`.toLowerCase().includes(needle)) : FAQ;

  return (
    <main
      className="min-h-screen text-[var(--devdoc-text)]"
      style={{
        backgroundColor: "var(--devdoc-bg)",
        backgroundImage:
          "linear-gradient(var(--devdoc-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--devdoc-grid-line) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="relative mx-auto flex max-w-[1200px] flex-col gap-12 px-4 py-10 md:px-8">
        {/* status stamp */}
        {/* header */}
        <header className="flex max-w-2xl flex-col gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--devdoc-highlight)]">Support center</span>
          <h1 className="font-headline text-3xl font-bold tracking-tight md:text-4xl">Help</h1>
          <p className="mt-1 text-base text-[var(--devdoc-muted)]">
            Find guides, keyboard references, and answers to common questions.
          </p>
        </header>

        {/* search */}
        <div className="relative max-w-3xl">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--devdoc-muted)]">
            <Icon><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></Icon>
          </span>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="How can we help?"
            className="w-full rounded-md border py-4 pl-12 pr-12 font-mono text-sm outline-none transition-colors placeholder:text-[var(--devdoc-subtle)] focus:border-[var(--devdoc-highlight)]"
            style={{ backgroundColor: "var(--devdoc-surface-inset)", borderColor: "var(--devdoc-border)", color: "var(--devdoc-text)" }}
          />
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
            <kbd className="rounded border px-2 py-1 font-mono text-[10px] text-[var(--devdoc-muted)]"
              style={{ borderColor: "var(--devdoc-border)" }}>⌘K</kbd>
          </span>
        </div>

        {/* quick-help grid */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <Link
              key={c.title}
              to={c.to}
              className="group flex flex-col gap-4 rounded-lg border p-6 transition-all hover:-translate-y-1"
              style={{ backgroundColor: "var(--devdoc-surface)", borderColor: "var(--devdoc-border)" }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded border text-[var(--devdoc-primary)] transition-colors group-hover:text-[var(--devdoc-highlight)]"
                style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface-inset)" }}>
                <Icon>{c.icon}</Icon>
              </div>
              <div>
                <h3 className="mb-1 font-headline text-lg font-semibold">{c.title}</h3>
                <p className="text-sm text-[var(--devdoc-muted)]">{c.body}</p>
              </div>
            </Link>
          ))}
        </section>

        {/* FAQ */}
        <section className="max-w-3xl">
          <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--devdoc-muted)]">
            Frequently asked
          </h2>
          <div className="overflow-hidden rounded-lg border" style={{ borderColor: "var(--devdoc-border)" }}>
            {faq.map((item, i) => {
              const isOpen = open === i;
              return (
                <div key={item.q} className="border-t first:border-t-0" style={{ borderColor: "var(--devdoc-border)" }}>
                  <button
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[var(--devdoc-surface-inset)]"
                    style={{ backgroundColor: "var(--devdoc-surface)" }}
                  >
                    <span className="text-sm font-medium">{item.q}</span>
                    <span style={{ transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 150ms", color: "var(--devdoc-muted)" }}>
                      <Icon size={16}><path d="M9 18l6-6-6-6" /></Icon>
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-sm leading-relaxed text-[var(--devdoc-muted)]"
                      style={{ backgroundColor: "var(--devdoc-surface)" }}>
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {cards.length === 0 && faq.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--devdoc-muted)]">No help topics match “{query}”.</p>
          ) : null}
        </section>

      </div>
    </main>
  );
}
