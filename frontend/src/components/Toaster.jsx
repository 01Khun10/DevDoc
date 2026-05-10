import { useNotify } from "../context/NotificationContext";

const toneClasses = {
  info: "border-slate-200 bg-white text-slate-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  error: "border-red-200 bg-red-50 text-red-800"
};

function Toaster() {
  const { toasts, dismiss } = useNotify();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed right-4 top-20 z-50 grid w-[min(24rem,calc(100vw-2rem))] gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-lg border px-4 py-3 text-sm shadow-lg ${
            toneClasses[toast.tone] || toneClasses.info
          }`}
          role="status"
        >
          <div className="flex items-start justify-between gap-4">
            <p className="leading-6">{toast.message}</p>
            <button
              className="rounded px-2 text-lg leading-none text-slate-500 hover:bg-white/70 hover:text-slate-800"
              type="button"
              aria-label="Dismiss notification"
              onClick={() => dismiss(toast.id)}
            >
              x
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Toaster;
