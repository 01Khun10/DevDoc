import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path d="M5.433 13.917l1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65z" />
      </svg>
    ),
    label: "Structured Docs",
  },
  {
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3z" />
        <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865z" />
      </svg>
    ),
    label: "Traceability",
  },
  {
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1zm3 8V5.5a3 3 0 1 0-6 0V9h6z" clipRule="evenodd" />
      </svg>
    ),
    label: "Validation",
  },
  {
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75z" />
        <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
      </svg>
    ),
    label: "Export",
  },
];

function Login() {
  const { user, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "var(--devdoc-bg)" }}>
        <p className="text-sm font-medium" style={{ color: "var(--devdoc-muted)" }}>Loading DevDoc...</p>
      </main>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

  function updateField(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      await login(form);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setErrorMessage(error.message || "Unable to sign in");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "var(--devdoc-bg)", color: "var(--devdoc-text)" }}
    >
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -right-48 -top-48 h-96 w-96 rounded-full blur-3xl"
          style={{ backgroundColor: "var(--devdoc-primary-soft)" }}
        />
        <div
          className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full blur-3xl"
          style={{ backgroundColor: "var(--devdoc-primary-softer)" }}
        />
      </div>

      {/* Center content */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className="mb-6 text-center devdoc-fade-in">
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg"
            style={{ background: "linear-gradient(135deg, var(--devdoc-primary), #8b5cf6)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <h1 className="font-headline mt-4 text-2xl font-extrabold tracking-tight">DevDoc</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--devdoc-muted)" }}>
            Precision Editor for Technical Documentation
          </p>
        </div>

        {/* Card */}
        <section
          className="devdoc-fade-in w-full max-w-sm rounded-2xl border p-8"
          style={{
            backgroundColor: "var(--devdoc-surface)",
            borderColor: "var(--devdoc-border)",
            boxShadow: "var(--devdoc-shadow-lg)",
            animationDelay: "60ms"
          }}
        >
          <h2 className="font-headline text-xl font-extrabold">Sign in to DevDoc</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--devdoc-muted)" }}>
            Access your workspace and documentation projects.
          </p>

          {errorMessage ? (
            <div
              className="mt-4 rounded-lg border px-3 py-2.5 text-sm font-medium"
              style={{
                backgroundColor: "var(--devdoc-error-soft)",
                borderColor: "rgba(220,38,38,0.25)",
                color: "var(--devdoc-error)",
              }}
            >
              {errorMessage}
            </div>
          ) : null}

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="devdoc-label block mb-1.5" htmlFor="email">Email address</label>
              <input
                id="email"
                className="devdoc-soft-input w-full"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                value={form.email}
                onChange={updateField}
                required
              />
            </div>

            <div>
              <label className="devdoc-label block mb-1.5" htmlFor="password">Password</label>
              <input
                id="password"
                className="devdoc-soft-input w-full"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={updateField}
                required
              />
            </div>

            <button
              className="devdoc-gradient-button mt-2 w-full py-2.5 text-sm font-bold uppercase tracking-wide"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm" style={{ color: "var(--devdoc-muted)" }}>
            Need an account?{" "}
            <Link
              className="font-bold transition hover:underline"
              style={{ color: "var(--devdoc-primary)" }}
              to="/register"
            >
              Create one
            </Link>
          </p>
        </section>

        {/* Status pill */}
        <div
          className="mt-6 flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold devdoc-fade-in"
          style={{
            borderColor: "var(--devdoc-border)",
            backgroundColor: "var(--devdoc-surface)",
            color: "var(--devdoc-muted)",
            animationDelay: "120ms"
          }}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          READY
          <span className="opacity-40">•</span>
          SYSTEM_STABLE
        </div>
      </div>

      {/* Feature bar */}
      <footer
        className="relative border-t"
        style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
      >
        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-6 py-4">
          {FEATURES.map((feature, i) => (
            <div key={feature.label} className="flex items-center gap-2">
              {i > 0 && (
                <span className="hidden h-1 w-1 rounded-full sm:block" style={{ backgroundColor: "var(--devdoc-border-strong)" }} />
              )}
              <span
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest"
                style={{ color: "var(--devdoc-muted)" }}
              >
                <span style={{ color: "var(--devdoc-primary)" }}>{feature.icon}</span>
                {feature.label}
              </span>
            </div>
          ))}
        </div>
        <p className="pb-3 text-center text-[10px] font-medium uppercase tracking-widest" style={{ color: "var(--devdoc-subtle)" }}>
          © {new Date().getFullYear()} DevDoc Systems
        </p>
      </footer>
    </main>
  );
}

export default Login;
