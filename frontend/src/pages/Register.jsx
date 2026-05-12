import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const FEATURES = [
  { label: "Structured Docs" },
  { label: "Traceability" },
  { label: "Validation" },
  { label: "Export" },
];

function Register() {
  const { user, isLoading, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
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
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setErrorMessage(error.message || "Unable to create account");
      setFieldErrors(error.fields || {});
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
            animationDelay: "60ms",
          }}
        >
          <h2 className="font-headline text-xl font-extrabold">Create your account</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--devdoc-muted)" }}>
            Join the precision documentation workflow.
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
              <label className="devdoc-label block mb-1.5" htmlFor="name">Full name</label>
              <input
                id="name"
                className="devdoc-soft-input w-full"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={updateField}
              />
            </div>

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
              {fieldErrors.email ? (
                <p className="mt-1.5 text-xs font-medium" style={{ color: "var(--devdoc-error)" }}>
                  {fieldErrors.email}
                </p>
              ) : null}
            </div>

            <div>
              <label className="devdoc-label block mb-1.5" htmlFor="password">Password</label>
              <input
                id="password"
                className="devdoc-soft-input w-full"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={updateField}
                required
              />
              {fieldErrors.password ? (
                <p className="mt-1.5 text-xs font-medium" style={{ color: "var(--devdoc-error)" }}>
                  {fieldErrors.password}
                </p>
              ) : null}
            </div>

            {/* Security notice */}
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold"
              style={{
                backgroundColor: "var(--devdoc-success-soft)",
                color: "var(--devdoc-success)",
              }}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0">
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1zm3 8V5.5a3 3 0 1 0-6 0V9h6z" clipRule="evenodd" />
              </svg>
              Passwords are encrypted and stored securely.
            </div>

            <button
              className="devdoc-gradient-button mt-2 w-full py-2.5 text-sm font-bold uppercase tracking-wide"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm" style={{ color: "var(--devdoc-muted)" }}>
            Already have an account?{" "}
            <Link
              className="font-bold transition hover:underline"
              style={{ color: "var(--devdoc-primary)" }}
              to="/login"
            >
              Sign in
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
            animationDelay: "120ms",
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
        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-x-2 gap-y-2 px-6 py-4">
          {FEATURES.map((feature, i) => (
            <div key={feature.label} className="flex items-center gap-2">
              {i > 0 && (
                <span className="h-1 w-1 rounded-full" style={{ backgroundColor: "var(--devdoc-border-strong)" }} />
              )}
              <span
                className="text-[11px] font-bold uppercase tracking-widest"
                style={{ color: "var(--devdoc-muted)" }}
              >
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

export default Register;
