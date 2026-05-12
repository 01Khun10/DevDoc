import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import useAuth from "../../hooks/useAuth";

const languages = [
  { code: "en", label: "English" },
  { code: "ur", label: "Urdu" },
  { code: "ar", label: "Arabic" },
  { code: "de", label: "German" },
  { code: "es", label: "Spanish" },
];

function ProfileMenu() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { selectedLanguage, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const displayName = user?.name || user?.email || "Account";
  const initial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  function handleSignOut() {
    logout();
    setIsOpen(false);
    navigate("/login", { replace: true });
  }

  function close() {
    setIsOpen(false);
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex h-8 items-center gap-2 rounded-lg py-0.5 pl-0.5 pr-2 text-sm font-bold transition"
        style={{
          border: "1px solid var(--devdoc-border)",
          backgroundColor: "var(--devdoc-surface)",
          color: "var(--devdoc-text)",
        }}
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
      >
        <span
          className="flex h-7 w-7 items-center justify-center rounded-md text-xs font-black text-white"
          style={{ background: "var(--devdoc-primary)" }}
        >
          {initial}
        </span>
        <span className="hidden max-w-[100px] truncate lg:block">{user?.name || "Account"}</span>
      </button>

      {isOpen ? (
        <div
          className="devdoc-scale-in absolute right-0 z-50 mt-1.5 w-72 overflow-hidden rounded-xl border text-sm shadow-lg"
          style={{
            borderColor: "var(--devdoc-border)",
            backgroundColor: "var(--devdoc-surface)",
            color: "var(--devdoc-text)",
          }}
        >
          {/* User header */}
          <div
            className="border-b px-4 py-3.5"
            style={{
              borderColor: "var(--devdoc-border)",
              backgroundColor: "var(--devdoc-surface-muted)",
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-black text-white"
                style={{ background: "var(--devdoc-primary)" }}
              >
                {initial}
              </span>
              <div className="min-w-0">
                <p className="truncate font-bold">{user?.name || "Account"}</p>
                {user?.email ? (
                  <p className="truncate text-xs" style={{ color: "var(--devdoc-muted)" }}>
                    {user.email}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {/* Navigation links */}
          <div className="py-1">
            {[
              ["/profile", "My Profile"],
              ["/settings", "Settings"],
              ["/docs", "Documentation"],
              ["/help", "Help & FAQ"],
              ["/about", "About DevDoc"],
            ].map(([to, label]) => (
              <Link
                key={to}
                className="block px-4 py-2 font-medium transition"
                style={{ color: "var(--devdoc-text)" }}
                to={to}
                onClick={close}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--devdoc-surface-muted)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Language selector */}
          <div
            className="border-t px-4 py-3"
            style={{ borderColor: "var(--devdoc-border)" }}
          >
            <p className="devdoc-label mb-2">Language</p>
            <div className="grid grid-cols-2 gap-1">
              {languages.map((language) => (
                <button
                  key={language.code}
                  type="button"
                  onClick={() => setLanguage(language.code)}
                  className="rounded-md px-2.5 py-1.5 text-left text-xs font-bold transition"
                  style={{
                    backgroundColor:
                      selectedLanguage === language.code
                        ? "var(--devdoc-primary-soft)"
                        : "transparent",
                    color:
                      selectedLanguage === language.code
                        ? "var(--devdoc-primary)"
                        : "var(--devdoc-muted)",
                  }}
                >
                  {language.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sign out */}
          <div
            className="border-t p-1"
            style={{ borderColor: "var(--devdoc-border)" }}
          >
            <button
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-bold transition"
              style={{ color: "var(--devdoc-error)" }}
              type="button"
              onClick={handleSignOut}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--devdoc-surface-muted)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ProfileMenu;
