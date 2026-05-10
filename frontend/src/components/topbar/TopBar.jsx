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
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f3f4f5] text-slate-600 transition hover:bg-white hover:text-slate-900 hover:shadow-sm"
                type="button"
                title="Notifications"
                onClick={() => toggleMenu("alerts")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
              </button>
              {openMenu === "alerts" ? (
                <div className="absolute right-0 z-40 mt-2 w-72 rounded-lg border border-slate-200 bg-white p-4 text-sm shadow-xl">
                  <p className="font-semibold text-slate-950">No notifications yet.</p>
                  <p className="mt-2 leading-6 text-slate-600">
                    Document saves, validation results, and traceability updates
                    will appear here.
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

            <ProfileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
