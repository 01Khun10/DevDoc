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
        className="flex h-9 items-center gap-2 rounded-full border border-[var(--devdoc-border)] bg-[var(--devdoc-surface)] py-1 pl-1 pr-2 text-sm font-bold text-[var(--devdoc-text)] shadow-sm transition hover:border-[var(--devdoc-border-strong)] hover:bg-[var(--devdoc-surface-muted)]"
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[var(--devdoc-primary-strong)] to-[var(--devdoc-primary)] text-xs font-black text-white">
          {initial}
        </span>
        <span className="hidden max-w-[110px] truncate lg:block">{user?.name || "Account"}</span>
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-[var(--devdoc-border)] bg-[var(--devdoc-surface)] text-sm text-[var(--devdoc-text)] shadow-2xl">
          <div className="border-b border-[var(--devdoc-border)] bg-[var(--devdoc-surface-muted)] px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--devdoc-primary-strong)] to-[var(--devdoc-primary)] text-sm font-black text-white shadow-lg shadow-indigo-500/20">
                {initial}
              </span>
              <div className="min-w-0">
                <p className="truncate font-extrabold">{user?.name || "Account"}</p>
                {user?.email ? (
                  <p className="truncate text-xs text-[var(--devdoc-muted)]">{user.email}</p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="py-1.5">
            {[
              ["/profile", "My Profile"],
              ["/settings", "Settings"],
              ["/docs", "Documentation"],
              ["/help", "Help & FAQ"],
              ["/about", "About DevDoc"],
            ].map(([to, label]) => (
              <Link
                key={to}
                className="block px-4 py-2.5 font-semibold text-[var(--devdoc-text)] transition hover:bg-[var(--devdoc-surface-muted)]"
                to={to}
                onClick={close}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="border-t border-[var(--devdoc-border)] px-4 py-3">
            <p className="devdoc-label mb-2">Language</p>
            <div className="grid grid-cols-2 gap-1.5">
              {languages.map((language) => (
                <button
                  key={language.code}
                  type="button"
                  onClick={() => setLanguage(language.code)}
                  className="rounded-lg px-2.5 py-1.5 text-left text-xs font-bold transition hover:bg-[var(--devdoc-surface-muted)]"
                  style={{
                    backgroundColor:
                      selectedLanguage === language.code ? "var(--devdoc-primary-soft)" : "transparent",
                    color:
                      selectedLanguage === language.code ? "var(--devdoc-primary)" : "var(--devdoc-muted)",
                  }}
                >
                  {language.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-[var(--devdoc-border)] p-1.5">
            <button
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-[var(--devdoc-error)] transition hover:bg-[var(--devdoc-surface-muted)]"
              type="button"
              onClick={handleSignOut}
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
