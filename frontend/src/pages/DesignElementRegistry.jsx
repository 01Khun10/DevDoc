import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import InlineBadgeSelect from "../components/InlineBadgeSelect";
import { RegistryControls, sortAndSearch } from "../components/RegistryControls";
import { SkeletonCard } from "../components/ui";
import { useNotify } from "../context/NotificationContext";
import { useProject } from "../context/ProjectContext";
import {
  useCreateDesignElement,
  useDeleteDesignElement,
  useDesignElements,
  useUpdateDesignElement
} from "../api/designElements";
import useAuthGuard from "../api/useAuthGuard";

const ELEMENT_TYPES = ["MODULE", "COMPONENT", "SERVICE", "DATABASE", "INTERFACE", "OTHER"];

function DesignElementRegistry() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { project } = useProject();
  const { notify } = useNotify();
  const [form, setForm] = useState({ title: "", description: "", elementType: "" });
  const [formError, setFormError] = useState("");
  const [isDeletingId, setIsDeletingId] = useState("");
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight") || "";
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const { data: designElements = [], isLoading, error, refetch } = useDesignElements(id);
  const createMutation = useCreateDesignElement(id);
  const updateMutation = useUpdateDesignElement(id);
  const deleteMutation = useDeleteDesignElement(id);
  useAuthGuard(error, createMutation.error, deleteMutation.error);

  const visibleElements = useMemo(
    () => sortAndSearch(designElements, { sort, search }),
    [designElements, sort, search]
  );
  const errorType = error ? (error.status === 404 ? "not-found" : "load-error") : "";
  const isSubmitting = createMutation.isPending;

  // Validation deep link: scroll the highlighted design element into view with a 2.5s glow.
  useEffect(() => {
    if (!highlightId || isLoading) return;
    const element = document.getElementById(`artifact-${highlightId}`);
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    element.style.outline = "2px solid var(--devdoc-primary)";
    element.style.outlineOffset = "3px";
    const timer = setTimeout(() => {
      element.style.outline = "";
      element.style.outlineOffset = "";
    }, 2500);
    return () => clearTimeout(timer);
  }, [highlightId, isLoading]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;
    setFormError("");
    if (!form.title.trim()) {
      setFormError("Title is required.");
      return;
    }
    try {
      const created = await createMutation.mutateAsync({
        title: form.title,
        description: form.description || null,
        elementType: form.elementType || null
      });
      setForm({ title: "", description: "", elementType: "" });
      notify(`Design element ${created.code} created.`, { tone: "success" });
    } catch (mutationError) {
      setFormError(mutationError.message || "Could not create design element.");
    }
  }

  async function handleDelete(element) {
    if (!window.confirm(`Delete design element ${element.code}?`)) return;
    setIsDeletingId(element.id);
    try {
      await deleteMutation.mutateAsync(element.id);
      notify("Design element removed.", { tone: "success" });
    } catch (mutationError) {
      notify(mutationError.message || "Could not remove design element.", { tone: "error" });
    } finally {
      setIsDeletingId("");
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen px-6 py-8" style={{ backgroundColor: "var(--devdoc-bg)" }}>
        <div className="mx-auto grid max-w-5xl gap-3">
          <SkeletonCard lines={2} />
          <SkeletonCard lines={3} />
          <SkeletonCard lines={3} />
        </div>
      </main>
    );
  }

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
          <button className="devdoc-gradient-button mt-6" onClick={() => refetch()}>Retry</button>
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
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-headline text-lg font-extrabold">Design elements</h2>
              <span className="text-sm font-semibold" style={{ color: "var(--devdoc-muted)" }}>
                Showing {visibleElements.length} of {designElements.length}
              </span>
            </div>
            <RegistryControls sort={sort} onSortChange={setSort} search={search} onSearchChange={setSearch} />
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
              {visibleElements.map((element) => (
                <article
                  key={element.id}
                  id={`artifact-${element.id}`}
                  className="rounded-xl border p-4"
                  style={{
                    borderColor: "var(--devdoc-border)",
                    backgroundColor: "var(--devdoc-surface)"
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: "var(--devdoc-primary)" }}>{element.code}</span>
                        <InlineBadgeSelect
                          value={element.elementType || ""}
                          options={["", ...ELEMENT_TYPES]}
                          placeholder="No type"
                          onSelect={(next) =>
                            updateMutation
                              .mutateAsync({ designElementId: element.id, elementType: next || null })
                              .catch((mutationError) =>
                                notify(mutationError.message || "Could not update design element.", { tone: "error" })
                              )
                          }
                        />
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
