import { AnimatePresence, motion } from "framer-motion";
import { useNotify } from "../context/NotificationContext";

const NOTIF_KEY = "devdoc_notifications_enabled";
const TOAST_DURATION_MS = 4000;

const toneStyles = {
  info: {
    color: "var(--devdoc-info)",
    bg: "var(--devdoc-info-soft)",
    label: "ℹ",
  },
  success: {
    color: "var(--devdoc-success)",
    bg: "var(--devdoc-success-soft)",
    label: "✓",
  },
  warning: {
    color: "var(--devdoc-warning)",
    bg: "var(--devdoc-warning-soft)",
    label: "⚠",
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

  const visibleToasts = notificationsEnabled
    ? toasts
    : toasts.filter((toast) => toast.tone === "error");

  return (
    <div className="fixed bottom-4 right-4 z-50 grid w-[min(22rem,calc(100vw-2rem))] gap-2">
      <AnimatePresence>
        {visibleToasts.map((toast) => {
          const tone = toneStyles[toast.tone] || toneStyles.info;

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 96 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 96 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative cursor-pointer overflow-hidden rounded-xl border text-sm backdrop-blur-xl"
              style={{
                backgroundColor: "var(--devdoc-surface)",
                borderColor: "var(--devdoc-border)",
                color: "var(--devdoc-text)",
                boxShadow: "var(--devdoc-shadow-md)",
              }}
              role="status"
              onClick={() => dismiss(toast.id)}
            >
              <div className="flex items-start gap-3 px-4 py-3">
                <span
                  className="mt-0.5 flex h-5 min-w-5 items-center justify-center rounded-md text-[11px] font-black"
                  style={{ backgroundColor: tone.bg, color: tone.color }}
                >
                  {tone.label}
                </span>
                <p className="flex-1 leading-6 font-medium">{toast.message}</p>
                <button
                  className="devdoc-icon-button h-6 w-6 shrink-0 text-xs"
                  type="button"
                  aria-label="Dismiss notification"
                  onClick={(event) => {
                    event.stopPropagation();
                    dismiss(toast.id);
                  }}
                >
                  ✕
                </button>
              </div>
              <motion.div
                className="h-0.5"
                style={{ backgroundColor: tone.color, transformOrigin: "left" }}
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: TOAST_DURATION_MS / 1000, ease: "linear" }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default Toaster;
