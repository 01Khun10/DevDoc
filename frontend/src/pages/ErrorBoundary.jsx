import { Component } from "react";
import { Icon } from "../components/ui";

/* Global Error — Blueprint edition. Converted from Stitch "global_error_blueprint_edition_1".
 *
 * Implemented as a real React ERROR BOUNDARY so it actually catches render errors app-wide.
 * Wrap your router with it in App.jsx (or main.jsx):
 *
 *   import ErrorBoundary from "./pages/ErrorBoundary";
 *   <ErrorBoundary><RouterProvider .../></ErrorBoundary>
 *
 * You can also render <ErrorScreen/> directly as a route element if you want a static error page.
 */


export function ErrorScreen({ error, onReload, inline = false }) {
  const stamp = new Date().toISOString();
  return (
    <div
      className={`relative flex w-full flex-col overflow-hidden text-[var(--devdoc-text)] ${
        inline ? "min-h-[70vh]" : "h-screen w-screen"
      }`}
      style={{
        backgroundColor: "var(--devdoc-bg)",
        backgroundImage:
          "linear-gradient(var(--devdoc-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--devdoc-grid-line) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      {/* ambient traceability lines */}
      <div className="pointer-events-none absolute left-[20%] top-0 h-full w-px" style={{ backgroundColor: "var(--devdoc-grid-line)" }} />
      <div className="pointer-events-none absolute left-[80%] top-0 hidden h-full w-px md:block" style={{ backgroundColor: "var(--devdoc-grid-line)" }} />
      <div className="pointer-events-none absolute left-0 top-[15%] h-px w-full" style={{ backgroundColor: "var(--devdoc-grid-line)" }} />

      <main className="relative z-10 flex flex-grow items-center justify-center px-4">
        <div
          className="relative w-full max-w-lg rounded-xl border p-8"
          style={{ backgroundColor: "var(--devdoc-surface)", borderColor: "var(--devdoc-border)", boxShadow: "2px 2px 0 rgba(59,130,246,0.18)" }}
        >
          <div className="flex flex-col items-center gap-6 text-center">
            {/* crosshair icon */}
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border text-[var(--devdoc-error)]"
              style={{ borderColor: "var(--devdoc-error)", backgroundColor: "var(--devdoc-error-soft)" }}>
              <Icon size={32}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><path d="M12 9v4M12 17h.01" /></Icon>
              <span className="absolute top-1/2 -left-2 h-px w-2" style={{ backgroundColor: "var(--devdoc-error)" }} />
              <span className="absolute top-1/2 -right-2 h-px w-2" style={{ backgroundColor: "var(--devdoc-error)" }} />
              <span className="absolute -top-2 left-1/2 h-2 w-px" style={{ backgroundColor: "var(--devdoc-error)" }} />
              <span className="absolute -bottom-2 left-1/2 h-2 w-px" style={{ backgroundColor: "var(--devdoc-error)" }} />
            </div>

            <div className="flex w-full flex-col gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--devdoc-error)]">Error</span>
              <h1 className="font-headline text-3xl font-bold tracking-tight">Something came loose.</h1>
              <p className="mx-auto max-w-md text-base text-[var(--devdoc-muted)]">
                An unexpected error occurred. Your work is safe.
              </p>
            </div>

            <div className="mt-2 flex w-full flex-col gap-4 sm:flex-row">
              <button
                onClick={onReload || (() => window.location.reload())}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: "var(--devdoc-primary)" }}
              >
                <Icon><path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></Icon>
                Reload
              </button>
              <a
                href="/dashboard"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border px-6 py-3 text-sm transition-colors hover:bg-[var(--devdoc-surface-hover)]"
                style={{ borderColor: "var(--devdoc-border)", color: "var(--devdoc-text-secondary)" }}
              >
                <Icon><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></Icon>
                Back to dashboard
              </a>
            </div>

            {/* collapsible diagnostics */}
            <details className="w-full overflow-hidden rounded-lg border text-left"
              style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface-inset)" }}>
              <summary className="flex cursor-pointer list-none items-center justify-between p-3 font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--devdoc-muted)] hover:bg-[var(--devdoc-surface-hover)]">
                <span className="flex items-center gap-2">
                  <Icon size={14}><path d="M4 17l6-6-6-6M12 19h8" /></Icon>
                  Developer diagnostics
                </span>
              </summary>
              <div className="border-t p-4 font-mono text-[12px] leading-relaxed text-[var(--devdoc-muted)]"
                style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-bg)", whiteSpace: "pre-wrap" }}>
                {`> ERR_CODE: 0x82_BLUEPRINT_SNAP
> TIMESTAMP: ${stamp}
> MESSAGE: ${error?.message || "Unknown render error"}
> STATUS: Safe recovery active.`}
              </div>
            </details>
          </div>
        </div>
      </main>

      {/* corner title-block stamp */}
      <div className="absolute bottom-8 right-8 z-20 hidden sm:block">
        <div className="relative flex w-48 flex-col gap-1 border p-3 font-mono text-[11px] text-[var(--devdoc-muted)]"
          style={{ backgroundColor: "var(--devdoc-surface)", borderColor: "var(--devdoc-border)" }}>
          <span className="absolute left-0 top-0 h-px w-2" style={{ backgroundColor: "var(--devdoc-highlight)" }} />
          <span className="absolute left-0 top-0 h-2 w-px" style={{ backgroundColor: "var(--devdoc-highlight)" }} />
          <div className="mb-1 flex items-center justify-between border-b pb-1" style={{ borderColor: "var(--devdoc-border)" }}>
            <span>PROJECT</span><span className="text-[var(--devdoc-text)]">DEVDOC</span>
          </div>
          <div className="flex items-center justify-between">
            <span>SYS_STATUS</span><span className="font-bold text-[var(--devdoc-error)]">CRIT</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("DevDoc error boundary:", error, info);
  }
  render() {
    if (this.state.hasError) {
      // Inline boundaries sit inside the shell, so retry can just clear the
      // error rather than reloading the whole app.
      return (
        <ErrorScreen
          error={this.state.error}
          inline={this.props.inline}
          onReload={
            this.props.inline
              ? () => this.setState({ hasError: false, error: null })
              : () => window.location.reload()
          }
        />
      );
    }
    return this.props.children;
  }
}
