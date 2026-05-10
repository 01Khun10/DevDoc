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
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-slate-900">
        <p className="text-sm font-medium text-slate-600">Loading DevDoc...</p>
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f8f9fa] px-6 py-12 text-slate-950">
      <div className="pointer-events-none absolute right-[-12rem] top-[-12rem] h-[34rem] w-[34rem] rounded-full bg-indigo-100 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-10rem] left-[-10rem] h-[28rem] w-[28rem] rounded-full bg-emerald-100 blur-3xl" />
      <section className="devdoc-card relative w-full max-w-md p-10 md:p-12">
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-[#3525cd] to-[#4f46e5] text-lg font-black text-white shadow-lg shadow-indigo-500/20">
            D
          </span>
          <p className="font-headline mt-4 text-3xl font-extrabold tracking-tight text-slate-950">
            DevDoc
          </p>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
            IDE for documentation
          </p>
        </div>
        <h1 className="mt-10 text-3xl font-bold">Sign in</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Access your DevDoc workspace.</p>

        {errorMessage ? (
          <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-100">
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

        <p className="mt-6 text-center text-sm text-slate-600">
          Need an account?{" "}
          <Link className="font-semibold text-indigo-700 hover:text-indigo-800" to="/register">
            Create one
          </Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
