import { Link } from "react-router-dom";
import { useNotify } from "../../context/NotificationContext";
import Breadcrumb from "./Breadcrumb";
import ProfileMenu from "./ProfileMenu";
import SearchPlaceholder from "./SearchPlaceholder";

function TopBar() {
  const { notify } = useNotify();

  function showComingSoon(label) {
    notify(`${label} controls are coming soon.`, { tone: "info" });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <Link
            className="flex shrink-0 items-center gap-2 text-slate-950"
            to="/dashboard"
            aria-label="Go to dashboard"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-sm font-black text-white shadow-sm">
              D
            </span>
            <span className="text-lg font-extrabold tracking-tight">DevDoc</span>
          </Link>
          <div className="hidden h-8 w-px bg-slate-200 sm:block" />
          <Breadcrumb />
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <SearchPlaceholder />
          <div className="flex shrink-0 items-center gap-2">
            <button
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
              type="button"
              title="Notifications are coming soon."
              onClick={() => showComingSoon("Notification")}
            >
              Alerts
            </button>
            <button
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
              type="button"
              title="Theme controls are coming soon."
              onClick={() => showComingSoon("Theme")}
            >
              Theme
            </button>
            <button
              className="hidden rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 sm:inline-flex"
              type="button"
              title="Language controls are coming soon."
              onClick={() => showComingSoon("Language")}
            >
              EN
            </button>
            <Link
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
              to="/help"
            >
              Help
            </Link>
            <ProfileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
