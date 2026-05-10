import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function Login() {
  const { user, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--devdoc-bg)] px-6 text-[var(--devdoc-text)]">
        <p className="text-sm font-semibold text-[var(--devdoc-muted)]">Loading DevDoc...</p>
      </main>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  function updateField(event) {
    setForm((currentForm) => ({
      ...currentForm,
      [event.target.name]: event.target.value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--devdoc-bg)] px-6 py-12 text-[var(--devdoc-text)]">
      <div className="pointer-events-none absolute right-[-12rem] top-[-12rem] h-[34rem] w-[34rem] rounded-full bg-[var(--devdoc-primary-soft)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-10rem] left-[-10rem] h-[28rem] w-[28rem] rounded-full bg-[var(--devdoc-primary-softer)] blur-3xl" />
      <section className="devdoc-card relative w-full max-w-md p-10 md:p-12">
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-[var(--devdoc-primary-strong)] to-[var(--devdoc-primary)] text-lg font-black text-white shadow-lg shadow-indigo-500/20">
            D
          </span>
          <p className="font-headline mt-4 text-3xl font-extrabold tracking-tight text-[var(--devdoc-text)]">
            DevDoc
          </p>
          <p className="devdoc-label mt-1">
            IDE for documentation
          </p>
        </div>
        <h1 className="mt-10 text-3xl font-bold">Sign in</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--devdoc-muted)]">Access your DevDoc workspace.</p>

        {errorMessage ? (
          <div className="mt-6 rounded-2xl border px-4 py-3 text-sm font-semibold text-[var(--devdoc-error)]" style={{ backgroundColor: "color-mix(in srgb, var(--devdoc-error) 9%, transparent)", borderColor: "color-mix(in srgb, var(--devdoc-error) 32%, var(--devdoc-border))" }}>
            {errorMessage}
          </div>
        ) : null}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="devdoc-label">Email</span>
            <input
              className="devdoc-soft-input mt-2 w-full"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="name@company.com"
              value={form.email}
              onChange={updateField}
              required
            />
          </label>

          <label className="block">
            <span className="devdoc-label">Password</span>
            <input
              className="devdoc-soft-input mt-2 w-full"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              value={form.password}
              onChange={updateField}
              required
            />
          </label>

          <button
            className="devdoc-gradient-button w-full py-3.5"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--devdoc-muted)]">
          Need an account?{" "}
          <Link className="font-bold text-[var(--devdoc-primary)] hover:underline" to="/register">
            Create one
          </Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
