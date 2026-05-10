import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import useAuth from "../../hooks/useAuth";

const languages = [
  { code: "en", label: "English" },
  { code: "ur", label: "Urdu" },
  { code: "ar", label: "Arabic" },
  { code: "de", label: "German" },
  { code: "es", label: "Spanish" }
];

function ProfileMenu() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { selectedLanguage, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const displayName = user?.name || user?.email || "Account";
  const initial = displayName.charAt(0).toUpperCase();

  function handleSignOut() {
    logout();
    setIsOpen(false);
    navigate("/login", { replace: true });
  }

  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-teal-200 hover:bg-teal-50"
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((currentValue) => !currentValue)}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-700 text-xs font-bold text-white">
          {initial}
        </span>
        <span className="hidden max-w-32 truncate lg:inline">{displayName}</span>
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-40 mt-2 w-56 rounded-lg border border-slate-200 bg-white py-2 text-sm shadow-xl">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate font-semibold text-slate-900">{displayName}</p>
            {user?.email ? <p className="truncate text-xs text-slate-500">{user.email}</p> : null}
          </div>
          <Link
            className="block px-4 py-2 text-slate-700 hover:bg-slate-50"
            to="/profile"
            onClick={() => setIsOpen(false)}
          >
            My Profile
          </Link>
          <Link
            className="block px-4 py-2 text-slate-700 hover:bg-slate-50"
            to="/settings"
            onClick={() => setIsOpen(false)}
          >
            Settings
          </Link>
          <Link
            className="block px-4 py-2 text-slate-700 hover:bg-slate-50"
            to="/docs"
            onClick={() => setIsOpen(false)}
          >
            Docs
          </Link>
          <Link
            className="block px-4 py-2 text-slate-700 hover:bg-slate-50"
            to="/help"
            onClick={() => setIsOpen(false)}
          >
            Help / FAQ
          </Link>
          <Link
            className="block px-4 py-2 text-slate-700 hover:bg-slate-50"
            to="/about"
            onClick={() => setIsOpen(false)}
          >
            About DevDoc
          </Link>
          <div className="border-t border-slate-100 px-4 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Language</p>
            <div className="grid grid-cols-2 gap-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={`rounded-md px-2 py-1 text-left text-xs font-medium transition-colors ${
                    selectedLanguage === lang.code
                      ? "bg-teal-50 text-teal-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-slate-400">Full interface translation will be added later.</p>
          </div>
          <button
            className="block w-full border-t border-slate-100 px-4 py-2 text-left font-semibold text-red-700 hover:bg-red-50"
            type="button"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default ProfileMenu;
