import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";

const NOTIF_KEY = "devdoc_notifications_enabled";

const languages = [
  { code: "en", label: "English" },
  { code: "ur", label: "Urdu" },
  { code: "ar", label: "Arabic" },
  { code: "de", label: "German" },
  { code: "es", label: "Spanish" },
];

function SectionCard({ title, children }) {
  return (
    <section className="devdoc-card-border p-6">
      <h2 className="font-headline text-lg font-extrabold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SettingsPlaceholder() {
  const { theme, setTheme } = useTheme();
  const { selectedLanguage, setLanguage } = useLanguage();
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const stored = localStorage.getItem(NOTIF_KEY);
    return stored === null ? true : stored === "true";
  });

  function handleNotifToggle() {
    const next = !notificationsEnabled;
    setNotificationsEnabled(next);
    localStorage.setItem(NOTIF_KEY, String(next));
  }

  return (
    <main className="min-h-screen px-6 py-10" style={{ backgroundColor: "var(--devdoc-bg)", color: "var(--devdoc-text)" }}>
      <section className="mx-auto max-w-3xl">
        <Link className="text-sm font-bold text-[var(--devdoc-primary)] hover:underline" to="/dashboard">
          Back to dashboard
        </Link>

        <div className="mb-8 mt-4">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight">Settings</h1>
          <p className="mt-2 text-sm text-[var(--devdoc-muted)]">Manage your local preferences for DevDoc.</p>
        </div>

        <div className="grid gap-6">
          <SectionCard title="Appearance">
            <p className="mb-4 text-sm text-[var(--devdoc-muted)]">Choose how DevDoc looks for you. Applies immediately.</p>
            <div className="flex flex-wrap gap-3">
              {["light", "dark", "system"].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  className={`rounded-full border px-5 py-3 text-sm font-bold capitalize transition ${
                    theme === value
                      ? "border-[var(--devdoc-primary)] bg-[var(--devdoc-primary)] text-white"
                      : "border-[var(--devdoc-border)] bg-[var(--devdoc-surface)] text-[var(--devdoc-muted)] hover:border-[var(--devdoc-primary)] hover:text-[var(--devdoc-text)]"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-[var(--devdoc-subtle)]">Theme is saved locally and persists across sessions.</p>
          </SectionCard>

          <SectionCard title="Language">
            <p className="mb-4 text-sm text-[var(--devdoc-muted)]">
              Select your preferred display language. Full interface translation is coming later.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {languages.map((language) => (
                <button
                  key={language.code}
                  type="button"
                  onClick={() => setLanguage(language.code)}
                  className={`rounded-2xl border px-4 py-2.5 text-sm font-bold transition ${
                    selectedLanguage === language.code
                      ? "border-[var(--devdoc-primary)] bg-[var(--devdoc-primary-soft)] text-[var(--devdoc-primary)]"
                      : "border-[var(--devdoc-border)] bg-[var(--devdoc-surface)] text-[var(--devdoc-muted)] hover:bg-[var(--devdoc-surface-muted)]"
                  }`}
                >
                  {language.label}
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Notifications">
            <p className="mb-4 text-sm text-[var(--devdoc-muted)]">Control in-app toast notifications.</p>
            <button
              type="button"
              onClick={handleNotifToggle}
              className="flex w-full items-center justify-between rounded-2xl border border-[var(--devdoc-border)] bg-[var(--devdoc-surface)] p-4 text-left transition hover:bg-[var(--devdoc-surface-muted)]"
            >
              <span>
                <span className="block text-sm font-bold">Enable in-app notifications</span>
                <span className="mt-0.5 block text-xs text-[var(--devdoc-muted)]">Shows toast alerts for saves, validation results, and actions.</span>
              </span>
              <span className={`relative ml-4 h-6 w-11 shrink-0 rounded-full transition-colors ${notificationsEnabled ? "bg-[var(--devdoc-primary)]" : "bg-[var(--devdoc-border-strong)]"}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${notificationsEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
              </span>
            </button>
          </SectionCard>

          <SectionCard title="Editor Preferences">
            <p className="mb-4 text-sm text-[var(--devdoc-muted)]">Fine-grained editor controls are coming in a future release.</p>
            <div className="divide-y divide-[var(--devdoc-border)] rounded-2xl border border-[var(--devdoc-border)] bg-[var(--devdoc-surface)] px-4">
              {["Default font", "Auto-save interval", "Focus mode default"].map((label) => (
                <div key={label} className="flex items-center justify-between py-3">
                  <span className="text-sm font-medium">{label}</span>
                  <span className="rounded-full bg-[var(--devdoc-surface-muted)] px-2.5 py-1 text-xs font-bold text-[var(--devdoc-subtle)]">
                    Coming soon
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </section>
    </main>
  );
}

export default SettingsPlaceholder;
