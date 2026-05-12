import { useNotify } from "../context/NotificationContext";

const NOTIF_KEY = "devdoc_notifications_enabled";

const toneStyles = {
  info: {
    color: "var(--devdoc-info)",
    bg: "var(--devdoc-info-soft)",
    label: "i",
  },
  success: {
    color: "var(--devdoc-success)",
    bg: "var(--devdoc-success-soft)",
    label: "✓",
  },
  warning: {
    color: "var(--devdoc-warning)",
    bg: "var(--devdoc-warning-soft)",
    label: "!",
  },
  error: {
    color: "var(--devdoc-error)",
    bg: "var(--devdoc-error-soft)",
    label: "✕",
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
    <div className="fixed right-4 top-16 z-50 grid w-[min(22rem,calc(100vw-2rem))] gap-2">
      {visibleToasts.map((toast) => {
        const tone = toneStyles[toast.tone] || toneStyles.info;

        return (
          <div
            key={toast.id}
            className="devdoc-slide-down flex items-start gap-3 rounded-xl border px-4 py-3 text-sm backdrop-blur-xl"
            style={{
              backgroundColor: "var(--devdoc-surface)",
              borderColor: "var(--devdoc-border)",
              color: "var(--devdoc-text)",
              boxShadow: "var(--devdoc-shadow-md)",
            }}
            role="status"
          >
            <span
              className="mt-0.5 flex h-5 min-w-5 items-center justify-center rounded-md text-[10px] font-black"
              style={{
                backgroundColor: tone.bg,
                color: tone.color,
              }}
            >
              {tone.label}
            </span>
            <p className="flex-1 leading-6 font-medium">{toast.message}</p>
            <button
              className="devdoc-icon-button h-6 w-6 shrink-0 text-xs"
              type="button"
              aria-label="Dismiss notification"
              onClick={() => dismiss(toast.id)}
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default Toaster;
