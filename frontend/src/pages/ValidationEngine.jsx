import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import ValidationCharts from "../components/ValidationCharts";
import ValidationResultCard from "../components/ValidationResultCard";
import { Modal } from "../components/ui";
import { useProject } from "../context/ProjectContext";
import { useNotify } from "../context/NotificationContext";
import { getValidationRun } from "../services/validationService";
import { useRunValidation, useValidationRuns } from "../api/validation";
import { useProjectOverview } from "../api/projects";
import { useCreateUseCase } from "../api/useCases";
import { useCreateTraceabilityLink } from "../api/traceability";
import useAuthGuard from "../api/useAuthGuard";

const severityOrder = ["ERROR", "WARNING", "INFO"];

function formatDateTime(value) {
  if (!value) return "Not completed";
  return new Date(value).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
  });
}

function getScoreColor(score) {
  if (score >= 80) return "var(--devdoc-success)";
  if (score >= 50) return "var(--devdoc-warning)";
  return "var(--devdoc-error)";
}

function ValidationEngine() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { project } = useProject();
  const { notify } = useNotify();
  const [activeRun, setActiveRun] = useState(null);
  const [isLoadingRunId, setIsLoadingRunId] = useState("");
  const [runError, setRunError] = useState("");
  const [coveringFix, setCoveringFix] = useState(null);
  const [coveringError, setCoveringError] = useState("");

  const runsQuery = useValidationRuns(id);
  const runMutation = useRunValidation(id);
  const overviewQuery = useProjectOverview(id);
  const createUseCaseMutation = useCreateUseCase(id);
  const createLinkMutation = useCreateTraceabilityLink(id);
  useAuthGuard(runsQuery.error, runMutation.error);

  // sectionId -> documentId, so section findings can deep-link into the editor.
  const sectionDocumentMap = useMemo(() => {
    const map = {};
    for (const document of overviewQuery.data?.documents || []) {
      for (const sectionId of document.sectionIds || []) {
        map[sectionId] = document.id;
      }
    }
    return map;
  }, [overviewQuery.data]);
  const validationRuns = runsQuery.data || [];
  const isLoading = runsQuery.isLoading;
  const isRunning = runMutation.isPending;
  const errorType = runsQuery.error
    ? (runsQuery.error.status === 404 ? "not-found" : "load-error")
    : "";

  async function handleRunValidation() {
    setRunError("");
    try {
      const validationRun = await runMutation.mutateAsync();
      setActiveRun(validationRun);
    } catch (error) {
      setRunError(error.message || "Could not run validation.");
    }
  }

  async function handleSelectRun(runId) {
    setIsLoadingRunId(runId);
    setRunError("");
    try {
      const validationRun = await getValidationRun(id, runId);
      setActiveRun(validationRun);
    } catch (error) {
      setRunError(error.message || "Could not load validation run.");
    } finally {
      setIsLoadingRunId("");
    }
  }

  function handleOpenCoveringFix(result) {
    setCoveringError("");
    // "Requirement FR-001 ... is not covered" -> prefill a usable UC title.
    const codeMatch = result.message.match(/\b(FR|NFR)-\d+\b/);
    setCoveringFix({
      result,
      title: codeMatch ? `Covers ${codeMatch[0]}` : "",
      description: ""
    });
  }

  async function handleConfirmCoveringFix() {
    if (!coveringFix?.title.trim()) {
      setCoveringError("Title is required.");
      return;
    }

    try {
      const useCase = await createUseCaseMutation.mutateAsync({
        title: coveringFix.title.trim(),
        description: coveringFix.description.trim() || undefined
      });
      await createLinkMutation.mutateAsync({
        sourceType: "USE_CASE",
        sourceId: useCase.id,
        targetType: "REQUIREMENT",
        targetId: coveringFix.result.targetId,
        linkType: "covers"
      });
      setCoveringFix(null);
      notify(`${useCase.code} created and linked. Re-run validation to refresh results.`, { tone: "success" });
    } catch (error) {
      setCoveringError(
        (error.fields && Object.values(error.fields)[0]) ||
          error.message ||
          "Could not create covering use case."
      );
    }
  }

  const groupedResults = useMemo(() => {
    const results = activeRun?.results || [];
    return severityOrder.map((severity) => ({
      severity,
      results: results.filter((r) => r.severity === severity)
    }));
  }, [activeRun]);

  if (isLoading) return <LoadingSpinner fullScreen label="Loading validation..." />;

  if (errorType === "not-found") {
    return (
      <main className="flex min-h-screen items-center justify-center px-6" style={{ backgroundColor: "var(--devdoc-bg)" }}>
        <div className="devdoc-card-border max-w-md p-8 text-center">
          <p className="font-headline text-xl font-extrabold" style={{ color: "var(--devdoc-text)" }}>Project not found</p>
          <button className="devdoc-gradient-button mt-6" onClick={() => navigate("/dashboard")}>Back to dashboard</button>
        </div>
      </main>
    );
  }

  if (errorType === "load-error") {
    return (
      <main className="flex min-h-screen items-center justify-center px-6" style={{ backgroundColor: "var(--devdoc-bg)" }}>
        <div className="devdoc-card-border max-w-md p-8 text-center">
          <p className="font-headline text-xl font-extrabold" style={{ color: "var(--devdoc-text)" }}>Could not load validation</p>
          <p className="mt-2 text-sm" style={{ color: "var(--devdoc-muted)" }}>Check your connection and try again.</p>
          <button className="devdoc-gradient-button mt-6" onClick={() => runsQuery.refetch()}>Retry</button>
        </div>
      </main>
    );
  }

  const readinessScore = activeRun?.readinessScore ?? null;
  const resultCount = activeRun?.results?.length || 0;

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
            <h1 className="font-headline text-2xl font-extrabold tracking-tight">Doc-Linter Validation</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--devdoc-muted)" }}>
              Automated checks for missing documents, empty sections, and unlinked requirements.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {readinessScore !== null && (
              <div
                className="hidden items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-bold sm:flex"
                style={{
                  borderColor: "var(--devdoc-border)",
                  backgroundColor: "var(--devdoc-surface-muted)",
                  color: getScoreColor(readinessScore),
                }}
              >
                Score: {readinessScore}/100
              </div>
            )}
            <button
              className="devdoc-gradient-button gap-2"
              type="button"
              disabled={isRunning}
              onClick={handleRunValidation}
            >
              {isRunning ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Running...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  Run Validation
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-6">
        {runError ? (
          <div
            className="mb-5 rounded-xl border px-4 py-3 text-sm font-medium"
            style={{
              backgroundColor: "var(--devdoc-error-soft)",
              borderColor: "rgba(220,38,38,0.25)",
              color: "var(--devdoc-error)",
            }}
          >
            {runError}
          </div>
        ) : null}

        <ValidationCharts activeRun={activeRun} validationRuns={validationRuns} />

        <div className="grid gap-6 lg:grid-cols-[1fr_256px]">
          {/* Main results */}
          <div>
            {/* Score card */}
            {readinessScore !== null && (
              <div
                className="mb-5 rounded-xl border p-5"
                style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="devdoc-label">Readiness score</p>
                    <p className="mt-1 text-xs" style={{ color: "var(--devdoc-muted)" }}>
                      {resultCount} issue{resultCount !== 1 ? "s" : ""} · {formatDateTime(activeRun?.completedAt)}
                    </p>
                  </div>
                  <span
                    className="font-headline text-4xl font-extrabold"
                    style={{ color: getScoreColor(readinessScore) }}
                  >
                    {readinessScore}
                    <span className="text-xl" style={{ color: "var(--devdoc-subtle)" }}>/100</span>
                  </span>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full"
                  style={{ backgroundColor: "var(--devdoc-surface-muted)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${readinessScore}%`,
                      backgroundColor: getScoreColor(readinessScore),
                    }}
                  />
                </div>
              </div>
            )}

            {/* Results label */}
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-headline text-lg font-extrabold">Validation results</h2>
              {activeRun ? (
                <span className="text-xs" style={{ color: "var(--devdoc-muted)" }}>
                  {formatDateTime(activeRun.completedAt)}
                </span>
              ) : null}
            </div>

            {!activeRun ? (
              <div
                className="rounded-xl border py-16 text-center"
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="font-headline text-lg font-extrabold" style={{ color: "var(--devdoc-text)" }}>No run selected</p>
                <p className="mt-2 text-sm" style={{ color: "var(--devdoc-muted)" }}>
                  Click "Run Validation" or select a run from the history panel.
                </p>
              </div>
            ) : null}

            {activeRun && resultCount === 0 ? (
              <div
                className="rounded-xl border p-10 text-center"
                style={{
                  borderColor: "rgba(22,163,74,0.25)",
                  backgroundColor: "var(--devdoc-success-soft)",
                }}
              >
                <p className="font-headline text-lg font-extrabold" style={{ color: "var(--devdoc-success)" }}>
                  All checks passed
                </p>
                <p className="mt-2 text-sm" style={{ color: "var(--devdoc-muted)" }}>
                  No issues found. This project passes all documentation checks.
                </p>
              </div>
            ) : null}

            {activeRun && resultCount > 0 ? (
              <div className="grid gap-6">
                {groupedResults.map((group) =>
                  group.results.length > 0 ? (
                    <section key={group.severity}>
                      <div className="mb-3 flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{
                            backgroundColor:
                              group.severity === "ERROR" ? "var(--devdoc-error)" :
                              group.severity === "WARNING" ? "var(--devdoc-warning)" :
                              "var(--devdoc-info)",
                          }}
                        />
                        <h3
                          className="text-xs font-extrabold uppercase tracking-widest"
                          style={{
                            color:
                              group.severity === "ERROR" ? "var(--devdoc-error)" :
                              group.severity === "WARNING" ? "var(--devdoc-warning)" :
                              "var(--devdoc-info)",
                          }}
                        >
                          {group.severity}
                        </h3>
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-bold"
                          style={{
                            backgroundColor: "var(--devdoc-surface-muted)",
                            color: "var(--devdoc-muted)",
                          }}
                        >
                          {group.results.length}
                        </span>
                      </div>
                      <div className="grid gap-3">
                        {group.results.map((result) => (
                          <ValidationResultCard
                            key={result.id}
                            result={result}
                            projectId={id}
                            sectionDocumentMap={sectionDocumentMap}
                            onCreateCoveringUseCase={handleOpenCoveringFix}
                          />
                        ))}
                      </div>
                    </section>
                  ) : null
                )}
              </div>
            ) : null}
          </div>

          {/* Run history — FIXED: sticky + max-height + overflow scroll */}
          <aside
            className="lg:sticky lg:top-[52px] lg:max-h-[calc(100vh-76px)] lg:overflow-hidden flex flex-col rounded-xl border"
            style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
          >
            <div
              className="shrink-0 flex items-center justify-between border-b px-4 py-3"
              style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface-muted)" }}
            >
              <h2 className="font-headline text-sm font-extrabold">Run history</h2>
              <span
                className="rounded-full px-2 py-0.5 text-xs font-bold"
                style={{ backgroundColor: "var(--devdoc-surface)", color: "var(--devdoc-muted)" }}
              >
                {validationRuns.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {validationRuns.length === 0 ? (
                <p className="px-2 py-3 text-sm" style={{ color: "var(--devdoc-muted)" }}>
                  No runs yet. Run Validation to create the first result.
                </p>
              ) : (
                <div className="grid gap-1.5">
                  {validationRuns.map((run) => {
                    const isActive = activeRun?.id === run.id;
                    const scoreColor = run.readinessScore !== null && run.readinessScore !== undefined
                      ? getScoreColor(run.readinessScore)
                      : "var(--devdoc-muted)";

                    return (
                      <button
                        key={run.id}
                        className={`w-full rounded-lg border p-3 text-left text-xs transition-all duration-150 ${
                          isActive
                            ? "border-[var(--devdoc-primary)] bg-[var(--devdoc-primary-soft)]"
                            : "border-[var(--devdoc-border)] hover:border-[var(--devdoc-border-strong)] hover:bg-[var(--devdoc-surface-muted)]"
                        }`}
                        type="button"
                        onClick={() => handleSelectRun(run.id)}
                      >
                        <div className="mb-1.5 flex items-center justify-between gap-2">
                          <span className="truncate font-semibold" style={{ color: "var(--devdoc-text)" }}>
                            {formatDateTime(run.startedAt)}
                          </span>
                          <span
                            className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase"
                            style={{
                              backgroundColor: "var(--devdoc-surface-muted)",
                              color: "var(--devdoc-subtle)",
                            }}
                          >
                            {run.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between" style={{ color: "var(--devdoc-muted)" }}>
                          <span>
                            Score:{" "}
                            <strong style={{ color: scoreColor }}>
                              {run.readinessScore ?? "—"}
                            </strong>
                          </span>
                          <span>{run.resultCount} issue{run.resultCount !== 1 ? "s" : ""}</span>
                        </div>
                        {isLoadingRunId === run.id ? (
                          <p className="mt-1.5 text-[10px] font-semibold" style={{ color: "var(--devdoc-primary)" }}>
                            Loading...
                          </p>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* REQ-002 quick fix: create a use case and its covers link in one step */}
      <Modal
        isOpen={Boolean(coveringFix)}
        title="Create covering use case"
        onClose={() => setCoveringFix(null)}
        footer={
          <div className="flex justify-end gap-2">
            <button
              className="devdoc-button-secondary"
              style={{
                border: "1px solid var(--devdoc-border)",
                backgroundColor: "var(--devdoc-surface)",
                color: "var(--devdoc-text)"
              }}
              type="button"
              onClick={() => setCoveringFix(null)}
            >
              Cancel
            </button>
            <button
              className="devdoc-gradient-button"
              type="button"
              disabled={createUseCaseMutation.isPending || createLinkMutation.isPending}
              onClick={handleConfirmCoveringFix}
            >
              {createUseCaseMutation.isPending || createLinkMutation.isPending
                ? "Creating..."
                : "Create & Link"}
            </button>
          </div>
        }
      >
        {coveringFix ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm" style={{ color: "var(--devdoc-muted)" }}>
              Creates a use case and links it to the uncovered requirement with a covers link.
            </p>
            <p className="devdoc-inset text-sm" style={{ color: "var(--devdoc-text)" }}>
              {coveringFix.result.message}
            </p>
            <label className="flex flex-col gap-1 text-sm font-semibold" style={{ color: "var(--devdoc-text)" }}>
              Use case title
              <input
                className="rounded-lg px-3 py-2 text-sm font-normal outline-none"
                style={{
                  border: "1px solid var(--devdoc-border)",
                  backgroundColor: "var(--devdoc-surface-inset)",
                  color: "var(--devdoc-text)"
                }}
                value={coveringFix.title}
                maxLength={200}
                onChange={(event) => setCoveringFix({ ...coveringFix, title: event.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold" style={{ color: "var(--devdoc-text)" }}>
              Description (optional)
              <textarea
                className="min-h-20 rounded-lg px-3 py-2 text-sm font-normal outline-none"
                style={{
                  border: "1px solid var(--devdoc-border)",
                  backgroundColor: "var(--devdoc-surface-inset)",
                  color: "var(--devdoc-text)"
                }}
                value={coveringFix.description}
                onChange={(event) => setCoveringFix({ ...coveringFix, description: event.target.value })}
              />
            </label>
            {coveringError ? (
              <p className="text-sm font-medium" style={{ color: "var(--devdoc-error)" }}>{coveringError}</p>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </main>
  );
}

export default ValidationEngine;
