import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import CreateUseCaseForm from "../components/CreateUseCaseForm";
import UseCaseCard from "../components/UseCaseCard";
import { RegistryControls, sortAndSearch } from "../components/RegistryControls";
import { SkeletonCard } from "../components/ui";
import useKeyboardNav from "../hooks/useKeyboardNav";
import { useNotify } from "../context/NotificationContext";
import { useProject } from "../context/ProjectContext";
import { useCreateUseCase, useDeleteUseCase, useUpdateUseCase, useUseCases } from "../api/useCases";
import useAuthGuard from "../api/useAuthGuard";

function UseCaseRegistry() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { project } = useProject();
  const { notify } = useNotify();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight") || "";
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const { data: useCases = [], isLoading, error, refetch } = useUseCases(id);
  useAuthGuard(error);

  // Validation deep link: scroll the highlighted use case into view with a 2.5s glow.
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
  const createMutation = useCreateUseCase(id);
  const updateMutation = useUpdateUseCase(id);
  const deleteMutation = useDeleteUseCase(id);
  const errorType = error ? (error.status === 404 ? "not-found" : "load-error") : "";

  const visibleUseCases = useMemo(
    () => sortAndSearch(useCases, { sort, search }),
    [useCases, sort, search]
  );

  async function handleCreateUseCase(input) {
    return createMutation.mutateAsync(input);
  }

  function handleUseCaseCreated() {}

  async function handleUpdateUseCase(useCaseId, input) {
    return updateMutation.mutateAsync({ useCaseId, ...input });
  }

  async function handleDeleteUseCase(useCase) {
    if (!window.confirm(`Delete use case ${useCase.code}?`)) return;
    try {
      await deleteMutation.mutateAsync(useCase.id);
      notify(`Use case ${useCase.code} deleted.`, { tone: "success" });
    } catch (mutationError) {
      notify(mutationError.message || "Could not delete use case.", { tone: "error" });
    }
  }

  const { focusedId } = useKeyboardNav(visibleUseCases, {
    onEdit: (useCase) =>
      document.getElementById(`artifact-${useCase.id}`)?.querySelector("input, textarea")?.focus(),
    onDelete: handleDeleteUseCase
  });

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
          <p className="font-headline text-xl font-extrabold">Could not load use cases</p>
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
        <div className="mt-1.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-headline text-2xl font-extrabold tracking-tight">Use Case Registry</h1>
            <p className="mt-1 text-sm leading-6" style={{ color: "var(--devdoc-muted)" }}>
              Capture user goals and scenarios before linking them to requirements and document sections.
            </p>
          </div>
          <div
            className="flex items-center gap-3 rounded-lg border px-4 py-2 shrink-0"
            style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface-muted)" }}
          >
            <span className="font-headline text-2xl font-extrabold" style={{ color: "var(--devdoc-text)" }}>
              {useCases.length}
            </span>
            <span className="text-xs font-semibold" style={{ color: "var(--devdoc-muted)" }}>
              use case{useCases.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-6">
        {/* Context card */}
        <div
          className="mb-6 rounded-xl border p-4 text-sm leading-6"
          style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)", color: "var(--devdoc-muted)" }}
        >
          <span className="font-semibold" style={{ color: "var(--devdoc-text)" }}>Why this matters: </span>
          Use cases describe user intent before the system is mapped into requirements, traceability links, and diagrams.
        </div>

        {/* Create form */}
        <section
          id="create-use-case"
          className="mb-6 rounded-xl border p-5"
          style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
        >
          <h2 className="font-headline mb-4 text-base font-extrabold">Create use case</h2>
          <CreateUseCaseForm onCreate={handleCreateUseCase} onCreated={handleUseCaseCreated} />
        </section>

        {/* Use case list */}
        <section>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-headline text-lg font-extrabold">Use cases</h2>
              <span className="text-sm" style={{ color: "var(--devdoc-muted)" }}>
                Showing {visibleUseCases.length} of {useCases.length}
              </span>
            </div>
            <RegistryControls sort={sort} onSortChange={setSort} search={search} onSearchChange={setSearch} />
          </div>

          {useCases.length === 0 ? (
            <div
              className="rounded-xl border p-12 text-center"
              style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
            >
              <div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border"
                style={{
                  backgroundColor: "var(--devdoc-primary-soft)",
                  borderColor: "var(--devdoc-border)",
                  color: "var(--devdoc-primary)",
                }}
              >
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="font-headline text-lg font-extrabold">No use cases yet.</p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6" style={{ color: "var(--devdoc-muted)" }}>
                Use cases describe how actors interact with the system. Add them before registering requirements.
              </p>
              <div className="mt-6">
                <a className="devdoc-gradient-button" href="#create-use-case">Add Use Case</a>
              </div>
              <div
                className="mx-auto mt-6 max-w-xs rounded-xl border p-4 text-left text-xs"
                style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface-muted)" }}
              >
                <p className="font-bold" style={{ color: "var(--devdoc-text)" }}>Example</p>
                <p className="mt-1" style={{ color: "var(--devdoc-muted)" }}>
                  User logs in and reaches the dashboard.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              {visibleUseCases.map((useCase) => (
                <div
                  key={useCase.id}
                  id={`artifact-${useCase.id}`}
                  className="rounded-xl"
                  style={
                    focusedId === useCase.id
                      ? { outline: "2px solid var(--devdoc-primary)", outlineOffset: "3px" }
                      : undefined
                  }
                >
                  <UseCaseCard useCase={useCase} onUpdate={handleUpdateUseCase} />
                </div>
              ))}
            </div>
          )}
        </section>

        <div
          className="mt-6 rounded-xl border px-5 py-4 text-sm"
          style={{ borderColor: "var(--devdoc-border)", color: "var(--devdoc-muted)" }}
        >
          Link these use cases to requirements and document sections in the Traceability Matrix.
        </div>
      </div>
    </main>
  );
}

export default UseCaseRegistry;
