import { useEffect, useState } from "react";
import { Icon } from "../components/ui";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import useAuth from "../hooks/useAuth";

/*
 * Global app settings (route: /settings) — distinct from per-project ProjectSettings.
 * Appearance controls reuse the SAME localStorage keys as the Accessibility page so the two
 * stay in sync (reduce motion, text scale). Theme uses the real ThemeContext.
 */

const A11Y_KEYS = { motion: "devdoc-reduce-motion", scale: "devdoc-text-scale" };
function readBool(k) { try { return localStorage.getItem(k) === "true"; } catch { return false; } }
function readScale() { try { return localStorage.getItem(A11Y_KEYS.scale) || "default"; } catch { return "default"; } }
function applyRoot() {
  const r = document.documentElement;
  r.setAttribute("data-reduce-motion", String(readBool(A11Y_KEYS.motion)));
  r.setAttribute("data-text-scale", readScale());
}

function Planned() {
  return <span className="rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ color: "var(--devdoc-warning)", backgroundColor: "var(--devdoc-warning-soft)" }}>planned</span>;
}
function Card({ title, children }) {
  return (
    <section className="rounded-lg border p-6" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
      <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--devdoc-muted)]">{title}</h2>
      {children}
    </section>
  );
}
function Toggle({ checked, onChange }) {
  return (
    <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className="relative h-6 w-10 flex-shrink-0 rounded-full border transition-colors"
      style={{ backgroundColor: checked ? "var(--devdoc-primary)" : "var(--devdoc-surface-inset)", borderColor: checked ? "var(--devdoc-primary)" : "var(--devdoc-border)" }}>
      <span className="absolute top-1 h-4 w-4 rounded-full transition-transform"
        style={{ backgroundColor: checked ? "#fff" : "var(--devdoc-muted)", transform: checked ? "translateX(18px)" : "translateX(2px)" }} />
    </button>
  );
}
function Row({ label, hint, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div><p className="text-sm">{label}</p>{hint && <p className="text-[12px] text-[var(--devdoc-muted)]">{hint}</p>}</div>
      {children}
    </div>
  );
}

const SHORTCUTS = [
  ["Global search / palette", ["⌘", "K"]],
  ["Navigate list / tree", ["J", "K"]],
  ["Edit current document", ["E"]],
  ["Delete focused item", ["D"]],
  ["Close overlay", ["Esc"]],
];

export default function AppSettings() {
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [motion, setMotion] = useState(() => readBool(A11Y_KEYS.motion));
  const [scale, setScale] = useState(() => readScale());
  const [guidanceDefault, setGuidanceDefault] = useState(() => { try { return localStorage.getItem("devdoc-guidance-default") !== "false"; } catch { return true; } });

  useEffect(() => {
    try {
      localStorage.setItem(A11Y_KEYS.motion, String(motion));
      localStorage.setItem(A11Y_KEYS.scale, scale);
      localStorage.setItem("devdoc-guidance-default", String(guidanceDefault));
    } catch { /* ignore */ }
    applyRoot();
  }, [motion, scale, guidanceDefault]);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <main className="min-h-screen text-[var(--devdoc-text)]" style={{ backgroundColor: "var(--devdoc-bg)" }}>
      <div className="border-b px-6 py-5" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--devdoc-primary)]">Settings</p>
        <h1 className="mt-1.5 font-headline text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-[var(--devdoc-muted)]">Preferences for your DevDoc workspace</p>
      </div>

      <div className="mx-auto flex max-w-3xl flex-col gap-5 px-6 py-6">
        <Card title="Appearance">
          <Row label="Theme" hint="Light, dark, or match your system">
            <div className="flex rounded-md border p-0.5" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface-inset)" }}>
              {["light", "dark", "system"].map((t) => (
                <button key={t} onClick={() => setTheme(t)}
                  className="rounded px-3 py-1.5 text-[13px] font-medium capitalize transition-colors"
                  style={theme === t ? { backgroundColor: "var(--devdoc-surface)", color: "var(--devdoc-text)" } : { color: "var(--devdoc-muted)" }}>
                  {t}
                </button>
              ))}
            </div>
          </Row>
          <Row label="Reduce motion" hint="Minimize animations across the app">
            <Toggle checked={motion} onChange={setMotion} />
          </Row>
          <Row label="Text scale" hint="Increase text size everywhere">
            <div className="flex rounded-md border p-0.5" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface-inset)" }}>
              {["default", "large", "larger"].map((s) => (
                <button key={s} onClick={() => setScale(s)}
                  className="rounded px-3 py-1.5 text-[13px] font-medium capitalize transition-colors"
                  style={scale === s ? { backgroundColor: "var(--devdoc-surface)", color: "var(--devdoc-text)" } : { color: "var(--devdoc-muted)" }}>
                  {s}
                </button>
              ))}
            </div>
          </Row>
        </Card>

        <Card title="Editor">
          <Row label="Show guidance panel by default" hint="Open the guidance rail when entering a document">
            <Toggle checked={guidanceDefault} onChange={setGuidanceDefault} />
          </Row>
          <Row label="Autosave" hint="Documents autosave a few seconds after you stop typing">
            <span className="text-[13px] text-[var(--devdoc-success)]">Always on</span>
          </Row>
        </Card>

        <Card title="Notifications">
          <Row label="Validation complete"><Planned /></Row>
          <Row label="Share link opened"><Planned /></Row>
        </Card>

        <Card title="Keyboard shortcuts">
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {SHORTCUTS.map(([action, keys]) => (
              <div key={action} className="flex items-center justify-between py-1.5">
                <span className="text-[13px] text-[var(--devdoc-muted)]">{action}</span>
                <span className="flex gap-1">
                  {keys.map((k, i) => (
                    <span key={i} className="flex items-center gap-1">
                      {i > 0 && <span className="text-[var(--devdoc-subtle)]">+</span>}
                      <kbd className="rounded border px-1.5 py-0.5 font-mono text-[11px]" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface-inset)" }}>{k}</kbd>
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Account">
          <Row label="Profile" hint="Manage your name and password">
            <button onClick={() => navigate("/profile")} className="rounded-md border px-3 py-1.5 text-sm" style={{ borderColor: "var(--devdoc-border)", color: "var(--devdoc-text-secondary)" }}>Open profile</button>
          </Row>
          <div className="mt-2 border-t pt-3" style={{ borderColor: "var(--devdoc-border)" }}>
            <button onClick={handleLogout} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium" style={{ color: "var(--devdoc-error)" }}>
              <Icon><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></Icon>
              Log out
            </button>
          </div>
        </Card>
      </div>
    </main>
  );
}
