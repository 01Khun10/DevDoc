import { useState } from "react";
import { Icon } from "../components/ui";
import { Link, Navigate, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";


export default function Login() {
  const { user, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
    setError("");
    setSubmitting(true);
    try {
      await login(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Incorrect email or password");
    } finally {
      setSubmitting(false);
    }
  }

  async function demo() {
    setError("");
    setSubmitting(true);
    try {
      await login({ email: "demo@devdoc.local", password: "demo1234" });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Demo login unavailable");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 text-[var(--devdoc-text)]"
      style={{
        backgroundColor: "var(--devdoc-bg)",
        backgroundImage:
          "radial-gradient(ellipse 50% 50% at 50% 40%, rgba(59,130,246,0.06), transparent 70%), linear-gradient(var(--devdoc-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--devdoc-grid-line) 1px, transparent 1px)",
        backgroundSize: "auto, 24px 24px, 24px 24px",
      }}
    >
      <div className="relative w-full max-w-[400px] rounded-xl border p-5 sm:p-8"
        style={{ backgroundColor: "var(--devdoc-surface)", borderColor: "var(--devdoc-border)", boxShadow: "2px 2px 0 rgba(59,130,246,0.14)" }}>
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Link to="/" className="font-headline text-lg font-bold transition-colors hover:text-[var(--devdoc-primary)]">
            devdoc
          </Link>
          <span className="rounded border px-2 py-1 font-mono text-[11px] tracking-[0.15em] text-[var(--devdoc-muted)]"
            style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface-inset)" }}>SIGN IN</span>
          <h1 className="font-headline text-2xl font-bold tracking-tight">Welcome back</h1>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-md border px-3 py-2 text-[13px]"
            style={{ borderColor: "var(--devdoc-error)", backgroundColor: "var(--devdoc-error-soft)", color: "var(--devdoc-error)" }}>
            <Icon size={15}><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></Icon>
            {error}
          </div>
        )}

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--devdoc-muted)]">Email address</label>
            <input id="email" name="email" type="email" required value={form.email} onChange={update}
              placeholder="name@company.com" autoComplete="email"
              className="w-full rounded-md border px-4 py-3 font-mono text-sm outline-none transition-colors placeholder:text-[var(--devdoc-subtle)] focus:border-[var(--devdoc-highlight)]"
              style={{ backgroundColor: "var(--devdoc-surface-inset)", borderColor: "var(--devdoc-border)", color: "var(--devdoc-text)" }} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--devdoc-muted)]">Password</label>
            <div className="relative">
              <input id="password" name="password" type={showPw ? "text" : "password"} required value={form.password} onChange={update}
                autoComplete="current-password"
                className="w-full rounded-md border px-4 py-3 pr-10 font-mono text-sm outline-none transition-colors focus:border-[var(--devdoc-highlight)]"
                style={{ backgroundColor: "var(--devdoc-surface-inset)", borderColor: "var(--devdoc-border)", color: "var(--devdoc-text)" }} />
              <button type="button" onClick={() => setShowPw((s) => !s)} aria-label="Toggle password visibility"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--devdoc-muted)] transition-colors hover:text-[var(--devdoc-highlight)]">
                {showPw
                  ? <Icon><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" /></Icon>
                  : <Icon><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></Icon>}
              </button>
            </div>
          </div>

          <button type="submit" disabled={submitting}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-md py-3 text-sm font-medium text-white transition-all disabled:opacity-70"
            style={{ backgroundColor: "var(--devdoc-primary)" }}>
            {submitting
              ? <><Icon size={16}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></Icon> Signing in…</>
              : "Sign in"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1" style={{ backgroundColor: "var(--devdoc-border)" }} />
          <span className="font-mono text-[10px] tracking-[0.15em] text-[var(--devdoc-subtle)]">OR</span>
          <span className="h-px flex-1" style={{ backgroundColor: "var(--devdoc-border)" }} />
        </div>

        <button type="button" onClick={demo} disabled={submitting}
          className="flex w-full flex-col items-center rounded-md border py-3 font-mono text-sm text-[var(--devdoc-highlight)] transition-all hover:bg-[var(--devdoc-surface-inset)] disabled:opacity-70"
          style={{ borderColor: "var(--devdoc-border)" }}>
          <span>Try the demo project</span>
          <span className="mt-0.5 text-[10px] text-[var(--devdoc-muted)]">demo@devdoc.local</span>
        </button>

        <p className="mt-6 text-center text-sm text-[var(--devdoc-muted)]">
          New to DevDoc?{" "}
          <Link to="/register" className="font-medium text-[var(--devdoc-primary)] transition-colors hover:text-[var(--devdoc-highlight)]">Create an account</Link>
        </p>

      </div>
    </main>
  );
}
