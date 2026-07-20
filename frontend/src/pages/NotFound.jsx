import { Link } from "react-router-dom";
import { Icon } from "../components/ui";

/* 404 — Blueprint edition. Converted from Stitch "404_not_found_blueprint_edition".
 * Standalone full-screen page (no AppShell) — wire OUTSIDE <AppShell> in App.jsx,
 * or reuse for the catch-all "*" route. */


export default function NotFound() {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden text-[var(--devdoc-text)]"
      style={{
        backgroundColor: "var(--devdoc-bg)",
        backgroundImage:
          "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(59,130,246,0.06), transparent 70%), linear-gradient(var(--devdoc-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--devdoc-grid-line) 1px, transparent 1px)",
        backgroundSize: "auto, 24px 24px, 24px 24px",
      }}
    >
      {/* faint isometric broken-grid illustration */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-[0.04]"
        style={{ color: "var(--devdoc-border-strong)" }}>
        <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
          <g transform="scale(1.5) translate(100,100)">
            <path d="M200 100 L400 200 L200 300 L0 200 Z" fill="none" stroke="currentColor" />
            <path d="M200 300 L200 500 L400 400 L400 200 Z" fill="none" stroke="currentColor" />
            <path d="M0 200 L0 400 L200 500 L200 300 Z" fill="none" stroke="currentColor" />
            <path d="M150 100 L250 150 L150 200 L50 150 Z" fill="none" stroke="currentColor" transform="translate(0,-50)" />
            <path d="M300 250 L350 275 L300 300 L250 275 Z" fill="none" stroke="currentColor" transform="translate(50,0)" />
          </g>
        </svg>
      </div>

      {/* top-left branding block */}
      <div className="absolute left-8 top-8 z-10 hidden rounded border p-4 md:block"
        style={{ backgroundColor: "var(--devdoc-surface)", borderColor: "var(--devdoc-border)" }}>
        <p className="font-headline text-lg font-bold">DevDoc</p>
        <p className="mt-1 font-mono text-[11px] text-[var(--devdoc-muted)]">v.3.0</p>
      </div>

      {/* bottom-right title-block stamp */}
      <div className="absolute bottom-8 right-8 z-10 rounded border p-4 text-right"
        style={{ backgroundColor: "var(--devdoc-surface)", borderColor: "var(--devdoc-border)" }}>
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[11px] tracking-[0.1em] text-[var(--devdoc-error)]">ERR_CODE: 404</span>
          <span className="font-mono text-[11px] tracking-[0.1em] text-[var(--devdoc-muted)]">STATUS: NOT_FOUND</span>
        </div>
      </div>

      <main className="relative z-20 w-full max-w-[600px] px-4">
        <div className="flex flex-col items-center text-center">
          {/* dimension-annotated 404 */}
          <div className="relative mb-12 flex w-full justify-center">
            <div className="absolute left-0 top-1/2 h-px w-[20%] -translate-y-1/2"
              style={{ backgroundColor: "var(--devdoc-border-strong)" }}>
              <span className="absolute right-0 top-[-4px] h-[9px] w-px" style={{ backgroundColor: "var(--devdoc-border-strong)" }} />
            </div>
            <div className="absolute right-0 top-1/2 h-px w-[20%] -translate-y-1/2"
              style={{ backgroundColor: "var(--devdoc-border-strong)" }}>
              <span className="absolute left-0 top-[-4px] h-[9px] w-px" style={{ backgroundColor: "var(--devdoc-border-strong)" }} />
            </div>
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-mono text-[11px] tracking-[0.15em] text-[var(--devdoc-subtle)]">
              Ø ERROR_DIMENSION
            </span>
            <h2 className="font-mono text-[120px] font-bold leading-none tracking-tighter text-[var(--devdoc-primary)] opacity-80"
              style={{ textShadow: "2px 2px 0 rgba(0,0,0,0.25)" }}>
              404
            </h2>
          </div>

          <h1 className="mb-4 font-headline text-3xl font-bold tracking-tight md:text-4xl">
            This page isn't on the blueprint.
          </h1>
          <p className="mx-auto mb-10 max-w-md text-base text-[var(--devdoc-muted)]">
            The requested resource could not be located in the current repository schema. It may have been
            moved, deleted, or never existed.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: "var(--devdoc-primary)" }}>
              <Icon><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></Icon>
              Back to dashboard
            </Link>
            <Link to="/"
              className="inline-flex items-center justify-center gap-2 rounded-lg border px-6 py-3 text-sm transition-colors hover:bg-[var(--devdoc-surface-hover)]"
              style={{ borderColor: "var(--devdoc-border)", color: "var(--devdoc-text)" }}>
              <Icon><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></Icon>
              Go home
            </Link>
          </div>

          <div className="mx-auto mt-16 h-24 w-px"
            style={{ background: "linear-gradient(to bottom, var(--devdoc-border-strong), transparent)" }} />
        </div>
      </main>
    </div>
  );
}
