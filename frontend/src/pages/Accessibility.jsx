import { useEffect, useState } from "react";
import { Icon } from "../components/ui";
import { A11Y_KEYS, applyA11yPrefs, readBool, readScale } from "../services/accessibility";

/*
 * Accessibility page — Blueprint edition.
 * Converted from Stitch "accessibility_blueprint_edition".
 *
 * KEY DIFFERENCE from About: the controls here are FUNCTIONAL, not decorative.
 * - "Reduce motion", "Text scale", "Focus outlines", "High contrast" write to <html> attributes
 *   and localStorage, so they actually change the app and persist across reloads.
 * - These read/write the SAME keys your global settings should use, so the App Settings page
 *   and this page stay in sync (see integration notes for the tiny bootstrap snippet).
 *
 * Renders under AppShell (which provides the TopBar), so no header here.
 */

/* ---- persistence helpers (module-level so Settings page can import them too) ---- */
const SHORTCUTS = [
  { action: "Global search", keys: ["⌘", "K"] },
  { action: "Command palette", keys: ["⌘", "K"] },
  { action: "Navigate list / tree", keys: ["J", "K"], sep: "/" },
  { action: "Edit current document", keys: ["E"] },
  { action: "Delete focused item", keys: ["D"] },
  { action: "Close overlay", keys: ["Esc"] },
];

const CONFORMANCE = [
  {
    group: "Perceivable",
    items: [
      "Minimum 4.5:1 text contrast across all critical surfaces.",
      "Artifact type colors paired with text labels — never color alone.",
      "Scalable text (up to Larger) without loss of content or function.",
    ],
  },
  {
    group: "Operable",
    items: [
      "Full keyboard operation: Tab order, ⌘K palette, J/K list nav, Esc to close.",
      "Visible focus indicators on every interactive element.",
      "Reduced-motion mode disables transforms and non-essential animation.",
    ],
  },
  {
    group: "Understandable",
    items: [
      "Consistent navigation and page-header structure across every screen.",
      "Inline validation with clear, specific error messages.",
      "Predictable component behavior — no unexpected context changes.",
    ],
  },
  {
    group: "Robust",
    items: [
      "Semantic HTML5 landmarks (nav, main, header) for structured navigation.",
      "ARIA roles and labels on complex widgets (editor, diagram viewer, graph).",
      "Accessible names on all icon-only buttons.",
    ],
  },
];


function Toggle({ id, checked, onChange, label, hint }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label htmlFor={id} className="flex cursor-pointer flex-col">
        <span className="text-sm font-medium text-[var(--devdoc-text)]">{label}</span>
        {hint && <span className="text-[13px] text-[var(--devdoc-muted)]">{hint}</span>}
      </label>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative h-6 w-10 flex-shrink-0 rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--devdoc-highlight)]"
        style={{
          backgroundColor: checked ? "var(--devdoc-primary)" : "var(--devdoc-surface-muted)",
          borderColor: checked ? "var(--devdoc-primary)" : "var(--devdoc-border)",
        }}
      >
        <span
          className="absolute top-1 h-4 w-4 rounded-full transition-transform"
          style={{
            backgroundColor: checked ? "#fff" : "var(--devdoc-muted)",
            transform: checked ? "translateX(18px)" : "translateX(2px)",
          }}
        />
      </button>
    </div>
  );
}

function Card({ eyebrow, children, className = "", corner }) {
  return (
    <section
      className={`relative overflow-hidden rounded-lg border p-6 ${className}`}
      style={{ backgroundColor: "var(--devdoc-surface)", borderColor: "var(--devdoc-border)" }}
    >
      {corner && (
        <div className="absolute right-3 top-3 opacity-30" style={{ color: "var(--devdoc-highlight)" }}>
          {corner}
        </div>
      )}
      <h2 className="mb-4 border-b pb-2 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--devdoc-muted)]"
          style={{ borderColor: "var(--devdoc-border)" }}>
        {eyebrow}
      </h2>
      {children}
    </section>
  );
}

export default function Accessibility() {
  const [motion, setMotion] = useState(() => readBool(A11Y_KEYS.motion));
  const [focus, setFocus] = useState(() => readBool(A11Y_KEYS.focus, true));
  const [contrast, setContrast] = useState(() => readBool(A11Y_KEYS.contrast));
  const [scale, setScale] = useState(() => readScale());

  useEffect(() => {
    try {
      localStorage.setItem(A11Y_KEYS.motion, String(motion));
      localStorage.setItem(A11Y_KEYS.focus, String(focus));
      localStorage.setItem(A11Y_KEYS.contrast, String(contrast));
      localStorage.setItem(A11Y_KEYS.scale, scale);
    } catch {
      /* storage unavailable — controls still work for the session */
    }
    applyA11yPrefs();
  }, [motion, focus, contrast, scale]);

  const [open, setOpen] = useState("Operable");

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
      <div className="relative mx-auto flex max-w-[1024px] flex-col gap-8 px-4 py-10 md:px-8">
        {/* corner status stamp */}
        {/* Page header */}
        <header className="flex flex-col gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--devdoc-highlight)]">
            Accessibility settings
          </span>
          <h1 className="font-headline text-3xl font-bold tracking-tight md:text-4xl">Accessibility</h1>
          <p className="mt-1 max-w-2xl text-base text-[var(--devdoc-muted)]">
            Our commitment, and your controls to tailor the DevDoc workspace to your needs.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          {/* Left — live controls */}
          <div className="flex flex-col gap-4 md:col-span-5">
            <Card
              eyebrow="Live controls"
              className="isometric-lift"
              corner={<Icon><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" /></Icon>}
            >
              <div className="flex flex-col gap-5">
                <Toggle id="a11y-motion" checked={motion} onChange={setMotion}
                  label="Reduce motion" hint="Minimize animations and transitions" />

                <div className="mt-1 flex flex-col gap-2">
                  <span className="text-sm font-medium">Larger text scale</span>
                  <div className="flex rounded border p-1" style={{ backgroundColor: "var(--devdoc-surface-muted)", borderColor: "var(--devdoc-border)" }}>
                    {["default", "large", "larger"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setScale(s)}
                        className="flex-1 rounded-sm px-2 py-1.5 text-center text-[13px] capitalize transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--devdoc-highlight)]"
                        style={
                          scale === s
                            ? { backgroundColor: "var(--devdoc-surface)", border: "1px solid var(--devdoc-border)", color: "var(--devdoc-text)" }
                            : { color: "var(--devdoc-muted)" }
                        }
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <Toggle id="a11y-focus" checked={focus} onChange={setFocus}
                  label="Always show focus outlines" hint="Keep focus rings visible for keyboard use" />

                <Toggle id="a11y-contrast" checked={contrast} onChange={setContrast}
                  label="High contrast" hint="Boost contrast on text and borders" />
              </div>
            </Card>
          </div>

          {/* Right — statement, table, conformance */}
          <div className="flex flex-col gap-4 md:col-span-7">
            <Card eyebrow="Commitment">
              <p className="mb-4 text-sm leading-relaxed text-[var(--devdoc-text)]">
                DevDoc aims for conformance with <strong>WCAG 2.1 Level AA</strong>. The interface supports
                complex technical documentation workflows while remaining fully operable via keyboard and
                assistive technologies.
              </p>
              <ul className="list-disc space-y-2 pl-5 text-sm text-[var(--devdoc-muted)] marker:text-[var(--devdoc-primary)]">
                <li>Semantic HTML5 landmarks for structured navigation.</li>
                <li>ARIA attributes on complex components (editor, diagram viewer, traceability graph).</li>
                <li>Minimum 4.5:1 contrast across all critical surfaces.</li>
              </ul>
            </Card>

            {/* Keyboard reference */}
            <section className="flex flex-col overflow-hidden rounded-lg border"
              style={{ borderColor: "var(--devdoc-border)" }}>
              <div className="flex items-center justify-between border-b p-4"
                style={{ backgroundColor: "var(--devdoc-surface)", borderColor: "var(--devdoc-border)" }}>
                <h3 className="font-headline text-lg font-medium">Keyboard reference</h3>
                <Icon><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12" /></Icon>
              </div>
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr style={{ backgroundColor: "var(--devdoc-surface-inset)" }}>
                    <th className="px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--devdoc-muted)]">Action</th>
                    <th className="px-4 py-2 text-right font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--devdoc-muted)]">Shortcut</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {SHORTCUTS.map((row) => (
                    <tr key={row.action} className="border-t" style={{ borderColor: "var(--devdoc-border)" }}>
                      <td className="px-4 py-3">{row.action}</td>
                      <td className="px-4 py-3 text-right">
                        {row.keys.map((k, i) => (
                          <span key={k + i}>
                            {i > 0 && <span className="mx-1 text-[var(--devdoc-muted)]">{row.sep || "+"}</span>}
                            <kbd className="inline-block rounded border px-2 py-1 font-mono text-[12px]"
                              style={{ backgroundColor: "var(--devdoc-surface-muted)", borderColor: "var(--devdoc-border)" }}>
                              {k}
                            </kbd>
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Conformance accordion */}
            <section className="flex flex-col overflow-hidden rounded-lg border"
              style={{ borderColor: "var(--devdoc-border)" }}>
              <div className="border-b p-4 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--devdoc-muted)]"
                style={{ backgroundColor: "var(--devdoc-surface)", borderColor: "var(--devdoc-border)" }}>
                Conformance details
              </div>
              {CONFORMANCE.map((c) => {
                const isOpen = open === c.group;
                return (
                  <div key={c.group} className="border-t first:border-t-0" style={{ borderColor: "var(--devdoc-border)" }}>
                    <button
                      onClick={() => setOpen(isOpen ? "" : c.group)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-[var(--devdoc-surface-inset)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--devdoc-highlight)]"
                    >
                      <span className="text-sm font-medium">{c.group}</span>
                      <span style={{ transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 150ms", color: "var(--devdoc-muted)" }}>
                        <Icon size={16}><path d="M9 18l6-6-6-6" /></Icon>
                      </span>
                    </button>
                    {isOpen && (
                      <ul className="list-disc space-y-2 px-4 pb-4 pl-9 text-sm text-[var(--devdoc-muted)] marker:text-[var(--devdoc-highlight)]">
                        {c.items.map((it) => <li key={it}>{it}</li>)}
                      </ul>
                    )}
                  </div>
                );
              })}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
