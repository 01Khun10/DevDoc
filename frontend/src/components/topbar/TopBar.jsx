import { useState } from "react";
import { Link } from "react-router-dom";
import { useNotify } from "../../context/NotificationContext";
import BackButton from "./BackButton";
import Breadcrumb from "./Breadcrumb";
import ProfileMenu from "./ProfileMenu";
import SearchPlaceholder from "./SearchPlaceholder";

function TopBar() {
  const { notify } = useNotify();
  const [openMenu, setOpenMenu] = useState("");

  function showComingSoon(label) {
    notify(`${label} controls are coming soon.`, { tone: "info" });
  }

  function toggleMenu(menuName) {
    setOpenMenu((currentMenu) => (currentMenu === menuName ? "" : menuName));
  }

  return (
    <header className="sticky top-0 z-30 bg-white/85 shadow-[0_20px_40px_rgba(53,37,205,0.06)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1700px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <BackButton />
          <Link
            className="flex shrink-0 items-center gap-2 text-slate-950"
            to="/dashboard"
            aria-label="Go to dashboard"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#3525cd] to-[#4f46e5] text-sm font-black text-white shadow-lg shadow-indigo-500/20">
              D
            </span>
            <span className="font-headline text-lg font-extrabold tracking-tight text-indigo-700">
              DevDoc
            </span>
          </Link>
          <div className="hidden h-8 w-px bg-slate-200/80 sm:block" />
          <Breadcrumb />
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <SearchPlaceholder />
          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-xs font-bold text-amber-700 shadow-sm ring-1 ring-amber-100 lg:flex">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Review ready
            </div>
            <div className="relative">
              <button
                className="rounded-full bg-[#f3f4f5] px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-white hover:shadow-sm"
                type="button"
                title="Notifications"
                onClick={() => toggleMenu("alerts")}
              >
                Alerts
              </button>
              {openMenu === "alerts" ? (
                <div className="absolute right-0 z-40 mt-2 w-72 rounded-lg border border-slate-200 bg-white p-4 text-sm shadow-xl">
                  <p className="font-semibold text-slate-950">No notifications yet.</p>
                  <p className="mt-2 leading-6 text-slate-600">
                    Notifications for document saves, validation runs, and traceability updates
                    will appear here later.
                  </p>
                </div>
              ) : null}
            </div>
            <div className="relative">
              <button
                className="rounded-full bg-[#f3f4f5] px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-white hover:shadow-sm"
                type="button"
                title="Theme settings"
                onClick={() => {
                  toggleMenu("theme");
                  showComingSoon("Theme");
                }}
              >
                Theme
              </button>
              {openMenu === "theme" ? (
                <div className="absolute right-0 z-40 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-xl">
                  Theme settings are coming soon.
                </div>
              ) : null}
            </div>
            <div className="relative hidden sm:block">
              <button
                className="rounded-full bg-[#f3f4f5] px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-white hover:shadow-sm"
                type="button"
                title="Language"
                onClick={() => {
                  toggleMenu("language");
                  showComingSoon("Language");
                }}
              >
                EN
              </button>
              {openMenu === "language" ? (
                <div className="absolute right-0 z-40 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-xl">
                  More languages coming later.
                </div>
              ) : null}
            </div>
            <ProfileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
