import { useNotify } from "../context/NotificationContext";

const NOTIF_KEY = "devdoc_notifications_enabled";

const toneStyles = {
  info: {
    color: "var(--devdoc-info)",
    label: "i",
  },
  success: {
    color: "var(--devdoc-success)",
    label: "OK",
  },
  warning: {
    color: "var(--devdoc-warning)",
    label: "!",
  },
  error: {
    color: "var(--devdoc-error)",
    label: "X",
  },
};

function Toaster() {
  const { toasts, dismiss } = useNotify();

  const notificationsEnabled = (() => {
    const stored = localStorage.getItem(NOTIF_KEY);
    return stored === null ? true : stored === "true";
  })();

  if (toasts.length === 0) return null;

  const visibleToasts = notificationsEnabled
    ? toasts
    : toasts.filter((toast) => toast.tone === "error");

  if (visibleToasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-20 z-50 grid w-[min(23rem,calc(100vw-2rem))] gap-2">
      {visibleToasts.map((toast) => {
        const tone = toneStyles[toast.tone] || toneStyles.info;

        return (
          <div
            key={toast.id}
            className="flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-xl"
            style={{
              backgroundColor: "var(--devdoc-surface)",
              borderColor: "var(--devdoc-border)",
              color: "var(--devdoc-text)",
            }}
            role="status"
          >
            <span
              className="mt-0.5 flex h-6 min-w-6 items-center justify-center rounded-full text-[10px] font-black"
              style={{
                backgroundColor: "color-mix(in srgb, currentColor 12%, transparent)",
                color: tone.color,
              }}
            >
              {tone.label}
            </span>
            <p className="flex-1 leading-6">{toast.message}</p>
            <button
              className="shrink-0 rounded-full px-2 text-base leading-6 text-[var(--devdoc-muted)] transition hover:bg-[var(--devdoc-surface-muted)] hover:text-[var(--devdoc-text)]"
              type="button"
              aria-label="Dismiss notification"
              onClick={() => dismiss(toast.id)}
            >
              x
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default Toaster;
