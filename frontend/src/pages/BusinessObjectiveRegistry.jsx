import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useProject } from "../context/ProjectContext";
import { useNotify } from "../context/NotificationContext";
import {
  useBusinessObjectives,
  useCreateBusinessObjective,
  useDeleteBusinessObjective,
  useUpdateBusinessObjective
} from "../api/businessObjectives";
import useAuthGuard from "../api/useAuthGuard";

const BO_TEAL = "#0d9488";

function ObjectiveForm({ initialValues, submitLabel, isPending, onSubmit, onCancel }) {
  const [title, setTitle] = useState(initialValues?.title || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [formError, setFormError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!title.trim()) {
      setFormError("Title is required.");
      return;
    }
    setFormError("");
    try {
      await onSubmit({ title: title.trim(), description: description.trim() || null });
      setTitle("");
      setDescription("");
    } catch (error) {
      setFormError(error.message || "Could not save business objective.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <div>
        <label className="devdoc-label mb-1.5 block">Title</label>
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
          style={{
            borderColor: "var(--devdoc-border)",
            backgroundColor: "var(--devdoc-bg)",
            color: "var(--devdoc-text)"
          }}
          maxLength={200}
          placeholder="e.g. Reduce documentation review time by 50%"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>
      <div>
        <label className="devdoc-label mb-1.5 block">Description (optional)</label>
        <textarea
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
          style={{
            borderColor: "var(--devdoc-border)",
            backgroundColor: "var(--devdoc-bg)",
            color: "var(--devdoc-text)"
          }}
          maxLength={5000}
          rows={3}
          placeholder="Why does this goal matter, and how will you measure it?"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>
      {formError ? (
        <p className="text-sm font-semibold" style={{ color: "var(--devdoc-danger, #dc2626)" }}>
          {formError}
        </p>
      ) : null}
      <div className="flex items-center gap-2">
        <button className="devdoc-gradient-button" type="submit" disabled={isPending}>
          {isPending ? "Saving..." : submitLabel}
        </button>
        {onCancel ? (
          <button
            className="rounded-lg border px-3 py-2 text-sm font-semibold"
            style={{ borderColor: "var(--devdoc-border)", color: "var(--devdoc-muted)" }}
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

function BusinessObjectiveRegistry() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { project } = useProject();
  const { notify } = useNotify();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight") || "";
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const cardRefs = useRef({});

  const { data: objectives = [], isLoading, error, refetch } = useBusinessObjectives(id);
  useAuthGuard(error);
  const createMutation = useCreateBusinessObjective(id);
  const updateMutation = useUpdateBusinessObjective(id);
  const deleteMutation = useDeleteBusinessObjective(id);
  const errorType = error ? (error.status === 404 ? "not-found" : "load-error") : "";

  // Validation deep link: scroll the highlighted objective into view with a glow.
  useEffect(() => {
    if (!highlightId || isLoading) return;
    const element = cardRefs.current[highlightId];
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

  async function handleCreate(input) {
    await createMutation.mutateAsync(input);
    notify("Business objective created.", { tone: "success" });
    setShowCreateForm(false);
  }

  async function handleUpdate(objectiveId, input) {
    await updateMutation.mutateAsync({ objectiveId, ...input });
    notify("Business objective updated.", { tone: "success" });
    setEditingId("");
  }

  async function handleDelete(objective) {
    if (!window.confirm(`Delete ${objective.code} "${objective.title}"?`)) return;
    setDeletingId(objective.id);
    try {
      await deleteMutation.mutateAsync(objective.id);
      notify("Business objective removed.", { tone: "success" });
    } catch (deleteError) {
      notify(deleteError.message || "Could not remove business objective.", { tone: "error" });
    } finally {
      setDeletingId("");
    }
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
          <p className="font-headline text-xl font-extrabold">Could not load business objectives</p>
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
      {/* Page header */}
      <div
        className="border-b px-6 py-5"
        style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
      >
        <p className="devdoc-label" style={{ color: "var(--devdoc-primary)" }}>{project.name}</p>
        <h1 className="font-headline mt-1.5 text-2xl font-extrabold tracking-tight">Business Objectives</h1>
        <p className="mt-1 text-sm leading-6" style={{ color: "var(--devdoc-muted)" }}>
          High-level goals your system must achieve. Use cases trace back to these.
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-6">
        {/* Count + add button */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold" style={{ color: "var(--devdoc-muted)" }}>
            {objectives.length} objective{objectives.length === 1 ? "" : "s"}
          </p>
          <button
            className="devdoc-gradient-button"
            type="button"
            onClick={() => setShowCreateForm((current) => !current)}
          >
            {showCreateForm ? "Close" : "Add Business Objective"}
          </button>
        </div>

        {showCreateForm ? (
          <section
            className="mb-6 rounded-xl border p-5"
            style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
          >
            <h2 className="font-headline mb-4 text-base font-extrabold">Create business objective</h2>
            <ObjectiveForm
              submitLabel="Create objective"
              isPending={createMutation.isPending}
              onSubmit={handleCreate}
            />
          </section>
        ) : null}

        {/* List */}
        {isLoading ? (
          <div className="grid gap-3">
            {[0, 1].map((index) => (
              <div
                key={index}
                className="animate-pulse rounded-xl border p-5"
                style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
              >
                <div className="h-4 w-24 rounded" style={{ backgroundColor: "var(--devdoc-surface-muted)" }} />
                <div className="mt-3 h-5 w-2/3 rounded" style={{ backgroundColor: "var(--devdoc-surface-muted)" }} />
                <div className="mt-2 h-4 w-1/2 rounded" style={{ backgroundColor: "var(--devdoc-surface-muted)" }} />
              </div>
            ))}
          </div>
        ) : objectives.length === 0 ? (
          <div
            className="rounded-xl border p-12 text-center"
            style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
          >
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border"
              style={{ backgroundColor: "var(--devdoc-primary-soft)", borderColor: "var(--devdoc-border)", color: BO_TEAL }}
            >
              <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
              </svg>
            </div>
            <p className="font-headline text-lg font-extrabold">No business objectives yet</p>
            <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: "var(--devdoc-muted)" }}>
              Business objectives define the high-level goals your system must achieve. Add one to anchor your use cases.
            </p>
            <button className="devdoc-gradient-button mt-6" type="button" onClick={() => setShowCreateForm(true)}>
              Add Business Objective
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {objectives.map((objective) => (
              <div
                key={objective.id}
                id={`artifact-${objective.id}`}
                ref={(element) => {
                  if (element) cardRefs.current[objective.id] = element;
                }}
                className="rounded-xl border p-5"
                style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
              >
                {editingId === objective.id ? (
                  <ObjectiveForm
                    initialValues={objective}
                    submitLabel="Save changes"
                    isPending={updateMutation.isPending}
                    onSubmit={(input) => handleUpdate(objective.id, input)}
                    onCancel={() => setEditingId("")}
                  />
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <span
                        className="inline-block rounded-md px-2 py-0.5 text-xs font-bold text-white"
                        style={{ backgroundColor: BO_TEAL }}
                      >
                        {objective.code}
                      </span>
                      <p className="font-headline mt-2 text-base font-extrabold">{objective.title}</p>
                      {objective.description ? (
                        <p className="mt-1 truncate text-sm" style={{ color: "var(--devdoc-muted)" }}>
                          {objective.description}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
                        style={{ borderColor: "var(--devdoc-border)", color: "var(--devdoc-text-secondary)" }}
                        type="button"
                        onClick={() => setEditingId(objective.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
                        style={{ borderColor: "var(--devdoc-border)", color: "var(--devdoc-danger, #dc2626)" }}
                        type="button"
                        disabled={deletingId === objective.id}
                        onClick={() => handleDelete(objective)}
                      >
                        {deletingId === objective.id ? "Removing..." : "Delete"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div
          className="mt-6 rounded-xl border px-5 py-4 text-sm"
          style={{ borderColor: "var(--devdoc-border)", color: "var(--devdoc-muted)" }}
        >
          Link objectives to the use cases they initiate in the Traceability Matrix.
        </div>
      </div>
    </main>
  );
}

export default BusinessObjectiveRegistry;
