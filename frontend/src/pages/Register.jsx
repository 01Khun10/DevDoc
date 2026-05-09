import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function Register() {
  const { user, isLoading, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
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
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 text-slate-950">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
          DevDoc
        </p>
        <h1 className="mt-3 text-3xl font-bold">Create account</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Start with a simple DevDoc account.
        </p>

        {errorMessage ? (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Name</span>
            <input
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              name="name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={updateField}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={updateField}
              required
            />
            {fieldErrors.email ? (
              <span className="mt-2 block text-sm text-red-700">{fieldErrors.email}</span>
            ) : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={updateField}
              required
            />
            {fieldErrors.password ? (
              <span className="mt-2 block text-sm text-red-700">
                {fieldErrors.password}
              </span>
            ) : null}
          </label>

          <button
            className="w-full rounded-md bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link className="font-semibold text-teal-700 hover:text-teal-800" to="/login">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}

export default Register;
