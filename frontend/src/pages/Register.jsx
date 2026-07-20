import { useMemo, useState } from "react";
import { Icon } from "../components/ui";
import { Link, Navigate, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";


function scorePassword(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}
const STRENGTH = [
  { label: "", color: "var(--devdoc-border)" },
  { label: "weak", color: "var(--devdoc-error)" },
  { label: "fair", color: "var(--devdoc-warning)" },
  { label: "good", color: "var(--devdoc-primary)" },
  { label: "strong", color: "var(--devdoc-success)" },
];

export default function Register() {
  const { user, isLoading, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const strength = useMemo(() => scorePassword(form.password), [form.password]);
  const mismatch = form.confirm.length > 0 && form.confirm !== form.password;

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "var(--devdoc-bg)" }}>
        <p className="font-mono text-sm" style={{ color: "var(--devdoc-muted)" }}>Loading DevDoc…</p>
      </main>
    );
  }
  if (user) return <Navigate to="/dashboard" replace />;

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError(""); setFieldErrors({});
    if (mismatch) { setFieldErrors({ confirm: "Passwords don't match" }); return; }
    setSubmitting(true);
    try {
      const { confirm, ...payload } = form;
      await register(payload);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to create account");
      setFieldErrors(err.fields || {});
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle = {
    backgroundColor: "var(--devdoc-surface-inset)",
    borderColor: "var(--devdoc-border)",
    color: "var(--devdoc-text)",
  };

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 text-[var(--devdoc-text)]"
      style={{
        backgroundColor: "var(--devdoc-bg)",
        backgroundImage:
          "radial-gradient(ellipse 50% 50% at 50% 40%, rgba(59,130,246,0.06), transparent 70%), linear-gradient(var(--devdoc-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--devdoc-grid-line) 1px, transparent 1px)",
        backgroundSize: "auto, 24px 24px, 24px 24px",
      }}
    >
      <div className="relative w-full max-w-[420px] rounded-xl border p-5 sm:p-8"
        style={{ backgroundColor: "var(--devdoc-surface)", borderColor: "var(--devdoc-border)", boxShadow: "2px 2px 0 rgba(59,130,246,0.14)" }}>
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Link to="/" className="font-headline text-lg font-bold transition-colors hover:text-[var(--devdoc-primary)]">
            devdoc
          </Link>
          <span className="rounded border px-2 py-1 font-mono text-[11px] tracking-[0.15em] text-[var(--devdoc-muted)]"
            style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface-inset)" }}>CREATE ACCOUNT</span>
          <h1 className="font-headline text-2xl font-bold tracking-tight">Start your first blueprint</h1>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-md border px-3 py-2 text-[13px]"
            style={{ borderColor: "var(--devdoc-error)", backgroundColor: "var(--devdoc-error-soft)", color: "var(--devdoc-error)" }}>
            <Icon size={15}><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></Icon>{error}
          </div>
        )}

        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field label="Full name" htmlFor="name" error={fieldErrors.name}>
            <input id="name" name="name" type="text" required value={form.name} onChange={update}
              placeholder="Ada Lovelace" autoComplete="name"
              className="w-full rounded-md border px-4 py-3 text-sm outline-none transition-colors placeholder:text-[var(--devdoc-subtle)] focus:border-[var(--devdoc-highlight)]"
              style={inputStyle} />
          </Field>

          <Field label="Email address" htmlFor="email" error={fieldErrors.email}>
            <input id="email" name="email" type="email" required value={form.email} onChange={update}
              placeholder="name@company.com" autoComplete="email"
              className="w-full rounded-md border px-4 py-3 font-mono text-sm outline-none transition-colors placeholder:text-[var(--devdoc-subtle)] focus:border-[var(--devdoc-highlight)]"
              style={inputStyle} />
          </Field>

          <Field label="Password" htmlFor="password" error={fieldErrors.password}>
            <div className="relative">
              <input id="password" name="password" type={showPw ? "text" : "password"} required value={form.password} onChange={update}
                autoComplete="new-password"
                className="w-full rounded-md border px-4 py-3 pr-10 font-mono text-sm outline-none transition-colors focus:border-[var(--devdoc-highlight)]"
                style={inputStyle} />
              <button type="button" onClick={() => setShowPw((s) => !s)} aria-label="Toggle password visibility"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--devdoc-muted)] hover:text-[var(--devdoc-highlight)]">
                {showPw
                  ? <Icon><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" /></Icon>
                  : <Icon><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></Icon>}
              </button>
            </div>
            {form.password && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex flex-1 gap-1">
                  {[1, 2, 3, 4].map((n) => (
                    <span key={n} className="h-1 flex-1 rounded-full transition-colors"
                      style={{ backgroundColor: n <= strength ? STRENGTH[strength].color : "var(--devdoc-border)" }} />
                  ))}
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wide" style={{ color: STRENGTH[strength].color }}>
                  {STRENGTH[strength].label}
                </span>
              </div>
            )}
          </Field>

          <Field label="Confirm password" htmlFor="confirm" error={fieldErrors.confirm || (mismatch ? "Passwords don't match" : "")}>
            <input id="confirm" name="confirm" type={showPw ? "text" : "password"} required value={form.confirm} onChange={update}
              autoComplete="new-password"
              className="w-full rounded-md border px-4 py-3 font-mono text-sm outline-none transition-colors focus:border-[var(--devdoc-highlight)]"
              style={{ ...inputStyle, borderColor: mismatch ? "var(--devdoc-error)" : "var(--devdoc-border)" }} />
          </Field>

          <button type="submit" disabled={submitting}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-md py-3 text-sm font-medium text-white transition-all disabled:opacity-70"
            style={{ backgroundColor: "var(--devdoc-primary)" }}>
            {submitting
              ? <><Icon size={16}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></Icon> Creating account…</>
              : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--devdoc-muted)]">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-[var(--devdoc-primary)] hover:text-[var(--devdoc-highlight)]">Sign in</Link>
        </p>
        <p className="mt-3 text-center text-xs leading-5 text-[var(--devdoc-subtle)]">
          DevDoc stores your account details to provide the service. Legal policy pages are not yet published.
        </p>

      </div>
    </main>
  );
}

function Field({ label, htmlFor, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--devdoc-muted)]">{label}</label>
      {children}
      {error && <span className="text-[12px] text-[var(--devdoc-error)]">{error}</span>}
    </div>
  );
}
