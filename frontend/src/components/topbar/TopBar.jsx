import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import BackButton from "./BackButton";
import Breadcrumb from "./Breadcrumb";
import ProfileMenu from "./ProfileMenu";
import GlobalSearch from "../GlobalSearch";

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
const THEME_CYCLE = ["light", "dark", "system"];

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

  function cycleTheme() {
    const idx = THEME_CYCLE.indexOf(theme);
    const next = THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
    setTheme(next);
  }

  return (
    <header
      className="sticky top-0 z-30 border-b backdrop-blur-xl"
      style={{
        borderColor: "var(--devdoc-border)",
        backgroundColor: "var(--devdoc-topbar)",
      }}
    >
      <div className="mx-auto flex max-w-[1700px] items-center gap-3 px-4 py-2.5 sm:px-6">
        {/* Left: Back + Logo + Breadcrumb */}
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <BackButton />
          <Link
            className="group flex shrink-0 items-center gap-2"
            to="/dashboard"
            aria-label="DevDoc dashboard"
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-black text-white shadow-sm transition-transform group-hover:scale-105"
              style={{ background: "var(--devdoc-primary)" }}
            >
              D
            </span>
            <span
              className="font-headline hidden text-base font-extrabold tracking-tight sm:block"
              style={{ color: "var(--devdoc-primary)" }}
            >
              DevDoc
            </span>
          </Link>
          <div className="hidden h-5 w-px sm:block" style={{ backgroundColor: "var(--devdoc-border)" }} />
          <Breadcrumb />
        </div>

        {/* Right: Search + Actions */}
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2" ref={menuRef}>
          <GlobalSearch />

          <div className="flex shrink-0 items-center gap-1">
            {/* Bell */}
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
                <div
                  className="devdoc-scale-in absolute right-0 z-40 mt-1.5 w-72 rounded-xl border p-4 text-sm shadow-lg"
                  style={{
                    borderColor: "var(--devdoc-border)",
                    backgroundColor: "var(--devdoc-surface)",
                    color: "var(--devdoc-text)",
                  }}
                >
                  <p className="font-bold">No notifications yet.</p>
                  <p className="mt-2 leading-6" style={{ color: "var(--devdoc-muted)" }}>
                    Document saves, validation results, and traceability updates will appear here.
                  </p>
                </div>
              ) : null}
            </div>

            {/* Theme toggle - compact single button */}
            <button
              className="devdoc-icon-button"
              type="button"
              title={`Theme: ${theme} - click to cycle`}
              onClick={cycleTheme}
            >
              {THEME_ICONS[theme]}
            </button>

            <ProfileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
