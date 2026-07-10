import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNotify } from "../context/NotificationContext";
import useAuth from "../hooks/useAuth";
import { getProject } from "../services/projectService";
import {
  createDesignElement,
  deleteDesignElement,
  listDesignElements
} from "../services/designElementService";

const ELEMENT_TYPES = ["MODULE", "COMPONENT", "SERVICE", "DATABASE", "INTERFACE", "OTHER"];

function DesignElementRegistry() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { notify } = useNotify();
  const [project, setProject] = useState(null);
  const [designElements, setDesignElements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorType, setErrorType] = useState("");
  const [form, setForm] = useState({ title: "", description: "", elementType: "" });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState("");

  const handleRequestError = useCallback(
    (error) => {
      if (error.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return true;
      }
      return false;
    },
    [logout, navigate]
  );

  const loadPage = useCallback(async () => {
    setIsLoading(true);
    setErrorType("");
    try {
      const [loadedProject, loadedElements] = await Promise.all([
        getProject(id),
        listDesignElements(id)
      ]);
      setProject(loadedProject);
      setDesignElements(loadedElements);
    } catch (error) {
      if (handleRequestError(error)) return;
      setErrorType(error.status === 404 ? "not-found" : "load-error");
    } finally {
      setIsLoading(false);
    }
  }, [handleRequestError, id]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;
    setFormError("");
    if (!form.title.trim()) {
      setFormError("Title is required.");
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await createDesignElement(id, {
        title: form.title,
        description: form.description || null,
        elementType: form.elementType || null
      });
      setDesignElements((cur) =>
        [...cur, created].sort((a, b) => a.code.localeCompare(b.code))
      );
      setForm({ title: "", description: "", elementType: "" });
      notify(`Design element ${created.code} created.`, { tone: "success" });
    } catch (error) {
      if (handleRequestError(error)) return;
      setFormError(error.message || "Could not create design element.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(element) {
    if (!window.confirm(`Delete design element ${element.code}?`)) return;
    setIsDeletingId(element.id);
    try {
      await deleteDesignElement(id, element.id);
      setDesignElements((cur) => cur.filter((item) => item.id !== element.id));
      notify("Design element removed.", { tone: "success" });
    } catch (error) {
      if (handleRequestError(error)) return;
      notify(error.message || "Could not remove design element.", { tone: "error" });
    } finally {
      setIsDeletingId("");
    }
  }

  if (isLoading) return <LoadingSpinner fullScreen label="Loading design elements..." />;

  if (errorType === "not-found") {
    return (
      <main className="flex min-h-screen items-center justify-center px-6" style={{ backgroundColor: "var(--devdoc-bg)" }}>
        <div className="devdoc-card-border max-w-md p-8 text-center">
          <p className="font-headline text-xl font-extrabold">Project not found</p>
          <button className="devdoc-gradient-button mt-6" onClick={() => navigate("/dashboard")}>Back to dashboard</button>
        </div>
      </main>
    );
  }

  if (errorType === "load-error") {
    return (
      <main className="flex min-h-screen items-center justify-center px-6" style={{ backgroundColor: "var(--devdoc-bg)" }}>
        <div className="devdoc-card-border max-w-md p-8 text-center">
          <p className="font-headline text-xl font-extrabold">Could not load design elements</p>
          <p className="mt-2 text-sm" style={{ color: "var(--devdoc-muted)" }}>Check your connection and try again.</p>
          <button className="devdoc-gradient-button mt-6" onClick={loadPage}>Retry</button>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen devdoc-fade-in"
      style={{ backgroundColor: "var(--devdoc-bg)", color: "var(--devdoc-text)" }}
    >
      <div
        className="border-b px-6 py-5"
        style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
      >
        <p className="devdoc-label" style={{ color: "var(--devdoc-primary)" }}>{project.name}</p>
        <h1 className="font-headline mt-1.5 text-2xl font-extrabold tracking-tight">Design Elements</h1>
        <p className="mt-1 text-sm leading-6" style={{ color: "var(--devdoc-muted)" }}>
          Register the modules, components, and services that implement your requirements, then link them in the Traceability Matrix.
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-6">
        <section
          className="mb-6 rounded-xl border p-5"
          style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
        >
          <h2 className="font-headline mb-4 text-base font-extrabold">Create design element</h2>
          <form className="grid gap-3" onSubmit={handleSubmit}>
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
              <input
                className="devdoc-input"
                maxLength={200}
                placeholder="Title (e.g. Authentication service)"
                value={form.title}
                onChange={(e) => setForm((cur) => ({ ...cur, title: e.target.value }))}
              />
              <select
                className="devdoc-input"
                value={form.elementType}
                onChange={(e) => setForm((cur) => ({ ...cur, elementType: e.target.value }))}
              >
                <option value="">Element type (optional)</option>
                {ELEMENT_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <textarea
              className="devdoc-input min-h-[5rem]"
              maxLength={5000}
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm((cur) => ({ ...cur, description: e.target.value }))}
            />
            {formError ? (
              <p className="text-sm font-semibold" style={{ color: "var(--devdoc-error)" }}>{formError}</p>
            ) : null}
            <div>
              <button className="devdoc-gradient-button" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Creating..." : "Create design element"}
              </button>
            </div>
          </form>
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-headline text-lg font-extrabold">Design elements</h2>
            <span className="text-sm font-semibold" style={{ color: "var(--devdoc-muted)" }}>
              {designElements.length} total
            </span>
          </div>

          {designElements.length === 0 ? (
            <div
              className="rounded-xl border p-12 text-center"
              style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
            >
              <p className="font-headline text-lg font-extrabold">No design elements yet</p>
              <p className="mt-2 text-sm" style={{ color: "var(--devdoc-muted)" }}>
                Create your first design element above, then link it to a requirement with an implemented_by link.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {designElements.map((element) => (
                <article
                  key={element.id}
                  className="rounded-xl border p-4"
                  style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: "var(--devdoc-primary)" }}>{element.code}</span>
                        {element.elementType ? (
                          <span
                            className="rounded-md px-2 py-0.5 text-xs font-semibold"
                            style={{ backgroundColor: "var(--devdoc-surface-muted)", border: "1px solid var(--devdoc-border)", color: "var(--devdoc-muted)" }}
                          >
                            {element.elementType}
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-2 text-sm font-semibold" style={{ color: "var(--devdoc-text)" }}>{element.title}</h3>
                      {element.description ? (
                        <p className="mt-1 text-sm leading-6" style={{ color: "var(--devdoc-muted)" }}>{element.description}</p>
                      ) : null}
                    </div>
                    <button
                      className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition disabled:opacity-40"
                      style={{
                        border: "1px solid color-mix(in srgb, var(--devdoc-error) 35%, var(--devdoc-border))",
                        backgroundColor: "var(--devdoc-error-soft)",
                        color: "var(--devdoc-error)"
                      }}
                      disabled={isDeletingId === element.id}
                      type="button"
                      onClick={() => handleDelete(element)}
                    >
                      {isDeletingId === element.id ? "Removing..." : "Delete"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <div
          className="mt-6 rounded-xl border px-5 py-4 text-sm"
          style={{ borderColor: "var(--devdoc-border)", color: "var(--devdoc-muted)" }}
        >
          Use the Traceability Matrix (Requirements → Design Elements) to mark which requirement each element implements.
        </div>
      </div>
    </main>
  );
}

export default DesignElementRegistry;
