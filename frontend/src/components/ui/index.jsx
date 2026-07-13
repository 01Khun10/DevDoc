// DevDoc UI primitives — thin wrappers over the --devdoc-* CSS variable theme.

const BUTTON_VARIANTS = {
  primary: {
    backgroundColor: "var(--devdoc-primary)",
    color: "#ffffff",
    border: "1px solid var(--devdoc-primary)"
  },
  secondary: {
    backgroundColor: "var(--devdoc-surface-muted)",
    color: "var(--devdoc-text-secondary)",
    border: "1px solid var(--devdoc-border)"
  },
  danger: {
    backgroundColor: "var(--devdoc-error-soft)",
    color: "var(--devdoc-error)",
    border: "1px solid color-mix(in srgb, var(--devdoc-error) 35%, var(--devdoc-border))"
  },
  success: {
    backgroundColor: "var(--devdoc-success-soft)",
    color: "var(--devdoc-success)",
    border: "1px solid color-mix(in srgb, var(--devdoc-success) 35%, var(--devdoc-border))"
  }
};

export function Button({ variant = "primary", className = "", style, children, ...props }) {
  return (
    <button
      type="button"
      className={`rounded-lg px-4 py-2 text-sm font-bold transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--devdoc-primary)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 ${className}`}
      style={{ ...BUTTON_VARIANTS[variant], ...style }}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({ className = "", style, children, ...props }) {
  return (
    <div
      className={`rounded-xl border p-4 ${className}`}
      style={{
        borderColor: "var(--devdoc-border)",
        backgroundColor: "var(--devdoc-surface)",
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
}

const BADGE_TONES = {
  primary: { backgroundColor: "var(--devdoc-primary-soft)", color: "var(--devdoc-primary)" },
  muted: {
    backgroundColor: "var(--devdoc-surface-muted)",
    border: "1px solid var(--devdoc-border)",
    color: "var(--devdoc-muted)"
  },
  success: { backgroundColor: "var(--devdoc-success-soft)", color: "var(--devdoc-success)" },
  warning: { backgroundColor: "var(--devdoc-warning-soft)", color: "var(--devdoc-warning)" },
  error: { backgroundColor: "var(--devdoc-error-soft)", color: "var(--devdoc-error)" }
};

export function Badge({ tone = "primary", className = "", style, children, ...props }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-bold ${className}`}
      style={{ ...BADGE_TONES[tone], ...style }}
      {...props}
    >
      {children}
    </span>
  );
}

export function EmptyState({ message, action, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-dashed p-8 text-sm ${className}`}
      style={{
        borderColor: "var(--devdoc-border)",
        backgroundColor: "var(--devdoc-surface)",
        color: "var(--devdoc-muted)"
      }}
    >
      <p>{message}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div
      className="border-b px-6 py-5"
      style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {eyebrow ? (
            <p className="devdoc-label" style={{ color: "var(--devdoc-primary)" }}>
              {eyebrow}
            </p>
          ) : null}
          <h1 className="font-headline mt-1.5 text-2xl font-extrabold tracking-tight">{title}</h1>
          {description ? (
            <p className="mt-1 max-w-3xl text-sm leading-6" style={{ color: "var(--devdoc-muted)" }}>
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

export function Skeleton({ className = "", style }) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className}`}
      style={{ backgroundColor: "var(--devdoc-surface-muted)", ...style }}
      aria-hidden="true"
    />
  );
}

const SKELETON_LINE_WIDTHS = ["w-3/4", "w-full", "w-5/6", "w-2/3", "w-1/2"];

export function SkeletonText({ width = "w-32", className = "" }) {
  return <div className={`devdoc-skeleton h-4 ${width} ${className}`} aria-hidden="true" />;
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div
      className="rounded-xl border p-5"
      style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
      aria-hidden="true"
    >
      <div className="flex gap-2">
        <div className="devdoc-skeleton h-6 w-16 !rounded-full" />
        <div className="devdoc-skeleton h-6 w-20 !rounded-full" />
      </div>
      <div className="mt-4 grid gap-2.5">
        {Array.from({ length: lines }).map((_, index) => (
          <SkeletonText key={index} width={SKELETON_LINE_WIDTHS[index % SKELETON_LINE_WIDTHS.length]} />
        ))}
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <main
      className="min-h-screen px-6 py-6"
      style={{ backgroundColor: "var(--devdoc-bg)" }}
      aria-busy="true"
    >
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-3 h-4 w-96" />
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="mt-6 h-64" />
    </main>
  );
}

export function Modal({ isOpen, title, onClose, children, footer }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-lg rounded-2xl border p-6 shadow-xl"
        style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-headline text-lg font-extrabold" style={{ color: "var(--devdoc-text)" }}>
            {title}
          </h2>
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--devdoc-primary)]"
            style={{ color: "var(--devdoc-muted)" }}
            aria-label="Close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="mt-4">{children}</div>
        {footer ? <div className="mt-6 flex justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  );
}

export function StatCard({ label, value, color = "var(--devdoc-text)" }) {
  return (
    <Card>
      <p className="devdoc-label">{label}</p>
      <p className="mt-2 font-headline text-2xl font-extrabold" style={{ color }}>
        {value}
      </p>
    </Card>
  );
}
