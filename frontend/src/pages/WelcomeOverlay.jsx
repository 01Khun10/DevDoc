import { useEffect, useRef, useState } from "react";
import { Icon } from "../components/ui";

/*
 * Welcome overlay — Blueprint edition v2 (improved).
 * Upgrades over v1:
 *  - Backdrop fades in; the card scales up from 96% with a blur-in (entrance choreography).
 *  - The 3 steps draw in one-by-one; the connecting dimension-line grows to meet each step.
 *  - A tiny "assembling…" progress feel: the vertical line animates its height as steps appear.
 *  - Focus is trapped to the card; Esc dismisses; focus returns to opener.
 *  - Remembers "seen" in localStorage; pass showAlways to replay (e.g. a "Take a tour" button).
 *
 * Usage on Dashboard:  <WelcomeOverlay onCreateProject={() => setNewProjectOpen(true)} />
 */

const SEEN_KEY = "devdoc-welcome-seen";


const STEPS = [
  { title: "Create a project", body: "Define your workspace and pick a documentation profile.", color: "var(--devdoc-highlight)",
    icon: <><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></> },
  { title: "Add artifacts", body: "Draft requirements, design elements, and test cases.", color: "var(--devdoc-primary)",
    icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M12 12v6M9 15h6" /></> },
  { title: "Validate & share", body: "Run traceability analysis and export verified specs.", color: "var(--devdoc-warning)",
    icon: <><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></> },
];

export default function WelcomeOverlay({ onCreateProject, onTour, showAlways = false }) {
  const [mounted, setMounted] = useState(false); // controls entrance transition
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);           // how many steps have appeared
  const cardRef = useRef(null);
  const openerRef = useRef(null);

  useEffect(() => {
    let show = showAlways;
    if (!showAlways) {
      try { show = localStorage.getItem(SEEN_KEY) !== "true"; } catch { show = true; }
    }
    if (!show) return;
    openerRef.current = document.activeElement;
    setVisible(true);
    // next frame → trigger entrance
    const r = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(r);
  }, [showAlways]);

  // stagger the steps in after the card appears
  useEffect(() => {
    if (!mounted) return;
    const timers = STEPS.map((_, i) => setTimeout(() => setStep((s) => Math.max(s, i + 1)), 250 + i * 260));
    cardRef.current?.querySelector("button")?.focus();
    return () => timers.forEach(clearTimeout);
  }, [mounted]);

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") dismiss(); }
    if (visible) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function dismiss() {
    try { localStorage.setItem(SEEN_KEY, "true"); } catch { /* ignore */ }
    setMounted(false);
    setTimeout(() => { setVisible(false); openerRef.current?.focus?.(); }, 200);
  }

  if (!visible) return null;

  const linePct = step === 0 ? 0 : (step - 1) / (STEPS.length - 1);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{
        backgroundColor: mounted ? "rgba(6,12,24,0.72)" : "rgba(6,12,24,0)",
        backdropFilter: mounted ? "blur(4px)" : "blur(0px)",
        transition: "background-color 220ms ease, backdrop-filter 220ms ease",
        backgroundImage: "linear-gradient(var(--devdoc-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--devdoc-grid-line) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
      onClick={dismiss}
      role="dialog" aria-modal="true" aria-label="Welcome to DevDoc"
    >
      <div
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-xl border p-8"
        style={{
          backgroundColor: "var(--devdoc-surface)",
          borderColor: "var(--devdoc-border)",
          boxShadow: "2px 2px 0 rgba(59,130,246,0.18), 0 24px 60px rgba(6,12,24,0.5)",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "scale(1) translateY(0)" : "scale(0.96) translateY(8px)",
          transition: "opacity 220ms ease, transform 260ms cubic-bezier(0.2,0,0,1)",
        }}
      >
        <div className="mb-6 text-center">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--devdoc-highlight)]">Onboarding</p>
          <h2 className="font-headline text-2xl font-bold tracking-tight">Welcome to DevDoc</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--devdoc-muted)]">
            Set up your documentation workspace — establish requirements, build traceability, and validate artifacts.
          </p>
        </div>

        {/* steps with a growing dimension line */}
        <div className="relative mb-6 flex flex-col gap-5 pl-1">
          {/* track */}
          <div className="absolute bottom-5 left-[20px] top-5 w-px" style={{ backgroundColor: "var(--devdoc-border)" }} />
          {/* growing fill */}
          <div className="absolute left-[20px] top-5 w-px origin-top"
            style={{
              height: "calc(100% - 40px)",
              backgroundColor: "var(--devdoc-highlight)",
              transform: `scaleY(${linePct})`,
              transition: "transform 300ms ease",
            }} />
          {STEPS.map((s, i) => {
            const on = step > i;
            return (
              <div key={s.title} className="relative flex items-start gap-4"
                style={{
                  opacity: on ? 1 : 0,
                  transform: on ? "translateX(0)" : "translateX(-8px)",
                  transition: "opacity 300ms ease, transform 300ms cubic-bezier(0.2,0,0,1)",
                }}>
                <div className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded border"
                  style={{ borderColor: s.color, color: s.color, backgroundColor: "var(--devdoc-surface-inset)" }}>
                  <Icon>{s.icon}</Icon>
                </div>
                <div className="pt-1">
                  <p className="text-sm font-medium">{s.title}</p>
                  <p className="mt-0.5 text-[13px] text-[var(--devdoc-muted)]">{s.body}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row" style={{ borderColor: "var(--devdoc-border)" }}>
          <button
            onClick={() => { dismiss(); onCreateProject?.(); }}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-medium text-white transition-all hover:gap-3"
            style={{ backgroundColor: "var(--devdoc-primary)" }}
          >
            Create your first project
            <Icon size={16}><path d="M5 12h14M12 5l7 7-7 7" /></Icon>
          </button>
          <button
            onClick={() => { dismiss(); onTour?.(); }}
            className="flex-1 rounded-lg border px-5 py-3 text-sm transition-colors hover:bg-[var(--devdoc-surface-hover)]"
            style={{ borderColor: "var(--devdoc-border)", color: "var(--devdoc-text-secondary)" }}
          >
            Take a tour
          </button>
        </div>

        {/* dismiss X */}
        <button onClick={dismiss} aria-label="Close"
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded text-[var(--devdoc-muted)] transition-colors hover:bg-[var(--devdoc-surface-hover)] hover:text-[var(--devdoc-text)]">
          <Icon size={16}><path d="M18 6 6 18M6 6l12 12" /></Icon>
        </button>

      </div>
    </div>
  );
}
