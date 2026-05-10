import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import BackButton from "./BackButton";
import Breadcrumb from "./Breadcrumb";
import ProfileMenu from "./ProfileMenu";
import SearchPlaceholder from "./SearchPlaceholder";

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
    <path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2ZM10 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM15.657 5.404a.75.75 0 1 0-1.06-1.06l-1.061 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM6.464 14.596a.75.75 0 1 0-1.06-1.06l-1.06 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM18 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 18 10ZM5 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 5 10ZM14.596 15.657a.75.75 0 0 0 1.06-1.06l-1.06-1.061a.75.75 0 1 0-1.06 1.06l1.06 1.06ZM5.404 6.464a.75.75 0 0 0 1.06-1.06L5.404 4.343a.75.75 0 0 0-1.06 1.06l1.06 1.061Z" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
    <path fillRule="evenodd" d="M7.455 2.004a.75.75 0 0 1 .26.77 7 7 0 0 0 9.958 7.967.75.75 0 0 1 1.067.853A8.5 8.5 0 1 1 6.647 1.921a.75.75 0 0 1 .808.083Z" clipRule="evenodd" />
  </svg>
);

const MonitorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
    <path fillRule="evenodd" d="M2 4.25A2.25 2.25 0 0 1 4.25 2h11.5A2.25 2.25 0 0 1 18 4.25v8.5A2.25 2.25 0 0 1 15.75 15h-3.105a3.501 3.501 0 0 0 1.1 1.677A.75.75 0 0 1 13.26 18H6.74a.75.75 0 0 1-.484-1.323A3.501 3.501 0 0 0 7.355 15H4.25A2.25 2.25 0 0 1 2 12.75v-8.5Z" clipRule="evenodd" />
  </svg>
);

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
  </svg>
);

const THEME_ICONS = { light: <SunIcon />, dark: <MoonIcon />, system: <MonitorIcon /> };

function TopBar() {
  const { theme, setTheme } = useTheme();
  const [openMenu, setOpenMenu] = useState("");
  const menuRef = useRef(null);

  useEffect(() => {
    if (!openMenu) return;
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenu]);

  function toggleMenu(name) {
    setOpenMenu((current) => (current === name ? "" : name));
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--devdoc-border)] bg-[var(--devdoc-topbar)] shadow-[var(--devdoc-shadow-soft)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1700px] flex-col gap-3 px-4 py-3 sm:px-6 lg:min-h-[64px] lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <BackButton />
          <Link
            className="group flex shrink-0 items-center gap-2"
            to="/dashboard"
            aria-label="DevDoc dashboard"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--devdoc-primary-strong)] to-[var(--devdoc-primary)] text-sm font-black text-white shadow-lg shadow-indigo-500/20 transition group-hover:scale-105">
              D
            </span>
            <span className="font-headline hidden text-lg font-extrabold tracking-tight text-[var(--devdoc-primary)] sm:block">
              DevDoc
            </span>
          </Link>
          <div className="hidden h-7 w-px bg-[var(--devdoc-border)] sm:block" />
          <Breadcrumb />
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-3" ref={menuRef}>
          <SearchPlaceholder />

          <div className="hidden items-center gap-2 rounded-full border border-[var(--devdoc-border)] bg-[var(--devdoc-surface)] px-3 py-2 text-xs font-bold text-[var(--devdoc-warning)] shadow-sm lg:flex">
            <span className="h-2 w-2 rounded-full bg-[var(--devdoc-warning)]" />
            Review ready
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <div className="relative">
              <button
                className="devdoc-icon-button"
                type="button"
                title="Notifications"
                onClick={() => toggleMenu("alerts")}
              >
                <BellIcon />
              </button>
              {openMenu === "alerts" ? (
                <div className="absolute right-0 z-40 mt-2 w-72 rounded-xl border border-[var(--devdoc-border)] bg-[var(--devdoc-surface)] p-4 text-sm text-[var(--devdoc-text)] shadow-xl">
                  <p className="font-bold">No notifications yet.</p>
                  <p className="mt-2 leading-6 text-[var(--devdoc-muted)]">
                    Document saves, validation results, and traceability updates will appear here.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="relative">
              <button
                className="devdoc-icon-button"
                type="button"
                title={`Theme: ${theme}`}
                onClick={() => toggleMenu("theme")}
              >
                {THEME_ICONS[theme]}
              </button>
              {openMenu === "theme" ? (
                <div className="absolute right-0 z-40 mt-2 w-40 rounded-xl border border-[var(--devdoc-border)] bg-[var(--devdoc-surface)] p-1.5 text-sm shadow-xl">
                  {(["light", "dark", "system"]).map((mode) => (
                    <button
                      key={mode}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left capitalize transition hover:bg-[var(--devdoc-surface-muted)]"
                      style={{
                        backgroundColor: theme === mode ? "var(--devdoc-primary-soft)" : "transparent",
                        color: theme === mode ? "var(--devdoc-primary)" : "var(--devdoc-text)",
                        fontWeight: theme === mode ? 800 : 600,
                      }}
                      type="button"
                      onClick={() => {
                        setTheme(mode);
                        setOpenMenu("");
                      }}
                    >
                      <span className="shrink-0">{THEME_ICONS[mode]}</span>
                      {mode}
                    </button>
                  ))}
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
