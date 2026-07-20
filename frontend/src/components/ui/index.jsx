// DevDoc UI primitives — thin wrappers over the --devdoc-* CSS variable theme.
import { useEffect, useId, useRef } from "react";

export { default as Tooltip } from "./Tooltip";

/* The one canonical inline-SVG icon wrapper. Pages must import this
 * instead of declaring their own. Pass lucide-style paths as children. */
export function Icon({ children, size = 16, className = "", ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {children}
    </svg>
  );
}

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
  },
  ghost: {
    backgroundColor: "transparent",
    color: "var(--devdoc-muted)",
    border: "1px solid transparent"
  }
};

const BUTTON_SIZES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm"
};

export function Spinner({ size = 16, className = "", label }) {
  return (
    <span
      className={`inline-block shrink-0 animate-spin rounded-full border-2 border-transparent ${className}`}
      style={{
        height: size,
        width: size,
        borderColor: "var(--devdoc-border)",
        borderTopColor: "currentColor"
      }}
      role="status"
      aria-label={label || "Loading"}
    />
  );
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  style,
  children,
  ...props
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-bold shadow-[var(--devdoc-shadow-xs)] transition-[transform,box-shadow,background-color,opacity] duration-150 ease-out hover:-translate-y-px hover:shadow-[var(--devdoc-shadow)] active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0 ${BUTTON_SIZES[size] || BUTTON_SIZES.md} ${className}`}
      style={{ ...BUTTON_VARIANTS[variant], ...style }}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner size={size === "sm" ? 12 : 14} /> : null}
      {children}
    </button>
  );
}

export function Card({ interactive = false, header, footer, className = "", style, children, ...props }) {
  return (
    <div
      className={`rounded-xl border shadow-[var(--devdoc-shadow-xs)] ${
        interactive ? "devdoc-hover-lift" : ""
      } ${header || footer ? "" : "p-4"} ${className}`}
      style={{
        borderColor: "var(--devdoc-border)",
        backgroundColor: "var(--devdoc-surface)",
        ...style
      }}
      {...props}
    >
      {header ? (
        <div className="border-b px-4 py-3" style={{ borderColor: "var(--devdoc-border)" }}>
          {header}
        </div>
      ) : null}
      {header || footer ? <div className="p-4">{children}</div> : children}
      {footer ? (
        <div
          className="border-t px-4 py-3"
          style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface-muted)" }}
        >
          {footer}
        </div>
      ) : null}
    </div>
  );
}

// Shared label/helper/error chrome for Input, Textarea, and Select.
// `className` on the public components targets the control itself, so layout
// classes for the wrapper (grid spans and the like) come in via fieldClassName.
function Field({ id, label, helper, error, required, className = "", children }) {
  return (
    <div className={`grid gap-1.5 ${className}`}>
      {label ? (
        <label htmlFor={id} className="text-xs font-bold" style={{ color: "var(--devdoc-text-secondary)" }}>
          {label}
          {required ? <span style={{ color: "var(--devdoc-error)" }}> *</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium" style={{ color: "var(--devdoc-error)" }}>
          {error}
        </p>
      ) : helper ? (
        <p id={`${id}-helper`} className="text-xs" style={{ color: "var(--devdoc-subtle)" }}>
          {helper}
        </p>
      ) : null}
    </div>
  );
}

const ERROR_STYLE = {
  borderColor: "var(--devdoc-error)",
  backgroundColor: "var(--devdoc-error-soft)"
};

function describedBy(id, helper, error) {
  if (error) return `${id}-error`;
  if (helper) return `${id}-helper`;
  return undefined;
}

export function Input({ label, helper, error, required, fieldClassName = "", className = "", style, id, ...props }) {
  const autoId = useId();
  const fieldId = id || autoId;

  return (
    <Field id={fieldId} label={label} helper={helper} error={error} required={required} className={fieldClassName}>
      <input
        id={fieldId}
        className={`devdoc-input w-full ${className}`}
        style={error ? { ...ERROR_STYLE, ...style } : style}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fieldId, helper, error)}
        {...props}
      />
    </Field>
  );
}

export function Textarea({ label, helper, error, required, fieldClassName = "", rows = 4, className = "", style, id, ...props }) {
  const autoId = useId();
  const fieldId = id || autoId;

  return (
    <Field id={fieldId} label={label} helper={helper} error={error} required={required} className={fieldClassName}>
      <textarea
        id={fieldId}
        rows={rows}
        className={`devdoc-input w-full resize-y ${className}`}
        style={error ? { ...ERROR_STYLE, ...style } : style}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fieldId, helper, error)}
        {...props}
      />
    </Field>
  );
}

export function Select({ label, helper, error, required, fieldClassName = "", options, className = "", style, id, children, ...props }) {
  const autoId = useId();
  const fieldId = id || autoId;

  return (
    <Field id={fieldId} label={label} helper={helper} error={error} required={required} className={fieldClassName}>
      <select
        id={fieldId}
        className={`devdoc-select w-full ${className}`}
        style={error ? { ...ERROR_STYLE, ...style } : style}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fieldId, helper, error)}
        {...props}
      >
        {options
          ? options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          : children}
      </select>
    </Field>
  );
}

/**
 * columns: [{ key, header, render?, width?, align? }]
 * Falls back to EmptyState when rows is empty; renders a skeleton while loading.
 */
export function Table({
  columns,
  rows,
  rowKey = (row, index) => row.id ?? index,
  loading = false,
  error,
  onRetry,
  emptyMessage = "Nothing here yet.",
  emptyAction,
  onRowClick,
  className = ""
}) {
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (loading) return <SkeletonCard lines={4} />;
  if (!rows?.length) return <EmptyState message={emptyMessage} action={emptyAction} />;

  return (
    <div
      className={`overflow-x-auto rounded-xl border ${className}`}
      style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
    >
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 z-[var(--devdoc-z-sticky)]">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="devdoc-label whitespace-nowrap border-b px-4 py-2.5 text-left"
                style={{
                  borderColor: "var(--devdoc-border)",
                  backgroundColor: "var(--devdoc-surface-muted)",
                  textAlign: column.align || "left",
                  width: column.width
                }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={rowKey(row, index)}
              className={`border-b transition-colors last:border-b-0 hover:bg-[var(--devdoc-surface-muted)] ${
                onRowClick ? "cursor-pointer" : ""
              }`}
              style={{ borderColor: "var(--devdoc-border)" }}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="px-4 py-2.5 align-top"
                  style={{ color: "var(--devdoc-text-secondary)", textAlign: column.align || "left" }}
                >
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
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

export function EmptyState({ icon, message, action, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-dashed p-8 text-center text-sm ${className}`}
      style={{
        borderColor: "var(--devdoc-border)",
        backgroundColor: "var(--devdoc-surface)",
        color: "var(--devdoc-muted)"
      }}
    >
      {icon ? (
        <div
          className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--devdoc-surface-muted)", color: "var(--devdoc-subtle)" }}
        >
          {icon}
        </div>
      ) : null}
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

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({ isOpen, title, onClose, children, footer }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocused = document.activeElement;
    panelRef.current?.querySelector(FOCUSABLE)?.focus();

    function onKeyDown(event) {
      if (event.key === "Escape") {
        onClose?.();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = panelRef.current?.querySelectorAll(FOCUSABLE);
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center px-6"
      style={{ zIndex: "var(--devdoc-z-modal)" }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="devdoc-fade-in absolute inset-0"
        style={{ backgroundColor: "rgba(15, 23, 42, 0.45)", backdropFilter: "blur(2px)" }}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="devdoc-scale-in relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border p-6"
        style={{
          borderColor: "var(--devdoc-border)",
          backgroundColor: "var(--devdoc-surface)",
          boxShadow: "var(--devdoc-shadow-lg)"
        }}
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

export function ErrorState({ message = "Something went wrong.", onRetry, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-dashed p-8 text-center ${className}`}
      style={{
        borderColor: "color-mix(in srgb, var(--devdoc-error) 40%, var(--devdoc-border))",
        backgroundColor: "var(--devdoc-error-soft)"
      }}
    >
      <div
        className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full text-lg font-black"
        style={{ backgroundColor: "var(--devdoc-error-soft)", color: "var(--devdoc-error)" }}
      >
        !
      </div>
      <p className="text-sm font-medium" style={{ color: "var(--devdoc-error)" }}>{message}</p>
      {onRetry ? (
        <button
          type="button"
          className="mt-4 rounded-lg border px-4 py-2 text-sm font-bold transition hover:-translate-y-0.5"
          style={{
            borderColor: "var(--devdoc-border)",
            backgroundColor: "var(--devdoc-surface)",
            color: "var(--devdoc-text)"
          }}
          onClick={onRetry}
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}
