import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import ValidationResultCard from "../components/ValidationResultCard";
import useAuth from "../hooks/useAuth";
import { getProject } from "../services/projectService";
import {
  getValidationRun,
  listValidationRuns,
  runValidation
} from "../services/validationService";

const severityOrder = ["ERROR", "WARNING", "INFO"];

function formatDateTime(value) {
  if (!value) return "Not completed";
  return new Date(value).toLocaleString();
}

function getScoreColor(score) {
  if (score >= 80) return "text-[var(--devdoc-success)]";
  if (score >= 50) return "text-[var(--devdoc-warning)]";
  return "text-[var(--devdoc-error)]";
}

function ValidationEngine() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [project, setProject] = useState(null);
  const [validationRuns, setValidationRuns] = useState([]);
  const [activeRun, setActiveRun] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoadingRunId, setIsLoadingRunId] = useState("");
  const [errorType, setErrorType] = useState("");
  const [runError, setRunError] = useState("");

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

  const loadHistory = useCallback(async () => {
    const runs = await listValidationRuns(id);
    setValidationRuns(runs);
    return runs;
  }, [id]);

  const loadPage = useCallback(async () => {
    setIsLoading(true);
    setErrorType("");
    setRunError("");
    try {
      const [loadedProject, runs] = await Promise.all([getProject(id), listValidationRuns(id)]);
      setProject(loadedProject);
      setValidationRuns(runs);
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

  async function handleRunValidation() {
    setIsRunning(true);
    setRunError("");
    try {
      const validationRun = await runValidation(id);
      setActiveRun(validationRun);
      await loadHistory();
    } catch (error) {
      if (handleRequestError(error)) return;
      setRunError(error.message || "Could not run validation.");
    } finally {
      setIsRunning(false);
    }
  }

  async function handleSelectRun(runId) {
    setIsLoadingRunId(runId);
    setRunError("");
    try {
      const validationRun = await getValidationRun(id, runId);
      setActiveRun(validationRun);
    } catch (error) {
      if (handleRequestError(error)) return;
      setRunError(error.message || "Could not load validation run.");
    } finally {
      setIsLoadingRunId("");
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
      <main className="flex min-h-screen items-center justify-center bg-[var(--devdoc-bg)] px-6">
        <div className="devdoc-card-border max-w-md p-8 text-center">
          <p className="font-headline text-xl font-extrabold text-[var(--devdoc-text)]">Project not found</p>
          <button className="devdoc-gradient-button mt-6" onClick={() => navigate("/dashboard")}>Back to dashboard</button>
        </div>
      </main>
    );
  }

  if (errorType === "load-error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--devdoc-bg)] px-6">
        <div className="devdoc-card-border max-w-md p-8 text-center">
          <p className="font-headline text-xl font-extrabold text-[var(--devdoc-text)]">Could not load validation</p>
          <p className="mt-2 text-sm text-[var(--devdoc-muted)]">Check your connection and try again.</p>
          <button className="devdoc-gradient-button mt-6" onClick={loadPage}>Retry</button>
        </div>
      </main>
    );
  }

  const readinessScore = activeRun?.readinessScore ?? null;
  const resultCount = activeRun?.results?.length || 0;

  return (
    <main className="min-h-screen bg-[var(--devdoc-bg)] px-6 py-8 text-[var(--devdoc-text)]">
      <section className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <p className="devdoc-label text-[var(--devdoc-primary)]">{project.name}</p>
          <h1 className="font-headline mt-2 text-4xl font-extrabold tracking-tight">Doc-Linter Validation</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--devdoc-muted)]">
            Run checks for missing documents, empty required sections, unlinked requirements, and incomplete documentation.
          </p>
        </div>

        {/* Run + Score */}
        <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_200px]">
          <div className="devdoc-card-border p-6">
            <h2 className="font-headline text-xl font-extrabold">Run project checks</h2>
            <p className="mt-2 text-sm text-[var(--devdoc-muted)]">
              Creates a saved run and records each issue as a validation result.
            </p>
            {runError ? (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
                {runError}
              </p>
            ) : null}
            <button
              className="devdoc-gradient-button mt-5"
              type="button"
              disabled={isRunning}
              onClick={handleRunValidation}
            >
              {isRunning ? "Running..." : "Run Validation"}
            </button>
          </div>

          <div className="devdoc-card-border flex flex-col items-center justify-center gap-2 p-6 text-center">
            <p className="devdoc-label">Readiness score</p>
            {readinessScore === null ? (
              <p className="text-sm text-[var(--devdoc-muted)]">Run validation first.</p>
            ) : (
              <>
                <p className={`font-headline text-5xl font-extrabold ${getScoreColor(readinessScore)}`}>
                  {readinessScore}
                <span className="text-2xl text-[var(--devdoc-muted)]">/100</span>
                </p>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[var(--devdoc-surface-muted)]">
                  <div
                    className={`h-full rounded-full transition-all ${readinessScore >= 80 ? "bg-emerald-500" : readinessScore >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                    style={{ width: `${readinessScore}%` }}
                  />
                </div>
                <p className="text-xs text-[var(--devdoc-muted)]">{resultCount} issue(s)</p>
              </>
            )}
          </div>
        </div>

        {/* Results + History */}
        <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-headline text-xl font-extrabold">Validation results</h2>
              {activeRun ? (
                <span className="text-xs text-[var(--devdoc-muted)]">
                  {formatDateTime(activeRun.completedAt)}
                </span>
              ) : null}
            </div>

            {!activeRun ? (
              <div className="devdoc-card-border p-10 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--devdoc-border)] bg-[var(--devdoc-primary-soft)] text-[var(--devdoc-primary)]">
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="font-headline text-lg font-extrabold text-[var(--devdoc-text)]">No run selected</p>
                <p className="mt-2 text-sm text-[var(--devdoc-muted)]">
                  Run validation or select a previous run from the history panel.
                </p>
              </div>
            ) : null}

            {activeRun && resultCount === 0 ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-800 dark:bg-emerald-950/20">
                <p className="font-headline text-lg font-extrabold text-emerald-800 dark:text-emerald-300">All checks passed</p>
                <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-400">
                  No issues found. This project passes all basic checks.
                </p>
              </div>
            ) : null}

            {activeRun && resultCount > 0 ? (
              <div className="grid gap-6">
                {groupedResults.map((group) =>
                  group.results.length > 0 ? (
                    <section key={group.severity}>
                      <h3 className={`mb-3 text-xs font-extrabold uppercase tracking-widest ${
                        group.severity === "ERROR" ? "text-red-600 dark:text-red-400" :
                        group.severity === "WARNING" ? "text-amber-600 dark:text-amber-400" :
                        "text-sky-600 dark:text-sky-400"
                      }`}>
                        {group.severity} - {group.results.length}
                      </h3>
                      <div className="grid gap-3">
                        {group.results.map((result) => (
                          <ValidationResultCard key={result.id} result={result} />
                        ))}
                      </div>
                    </section>
                  ) : null
                )}
              </div>
            ) : null}
          </div>

          <aside className="devdoc-card-border h-fit p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-headline text-base font-extrabold">Run history</h2>
              <span className="rounded-full bg-[var(--devdoc-surface-muted)] px-2 py-0.5 text-xs font-bold text-[var(--devdoc-muted)]">
                {validationRuns.length}
              </span>
            </div>

            {validationRuns.length === 0 ? (
              <p className="text-sm text-[var(--devdoc-muted)]">
                No runs yet. Click "Run Validation" to create the first result.
              </p>
            ) : (
              <div className="grid gap-2">
                {validationRuns.map((run) => (
                  <button
                    key={run.id}
                    className={`w-full rounded-xl border p-3 text-left text-xs transition ${
                      activeRun?.id === run.id
                        ? "border-[var(--devdoc-primary)] bg-[var(--devdoc-primary-soft)]"
                        : "border-[var(--devdoc-border)] hover:border-[var(--devdoc-primary)] hover:bg-[var(--devdoc-surface-muted)]"
                    }`}
                    type="button"
                    onClick={() => handleSelectRun(run.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-semibold text-[var(--devdoc-text)]">
                        {formatDateTime(run.startedAt)}
                      </span>
                      <span className="shrink-0 rounded-full bg-[var(--devdoc-surface-muted)] px-1.5 py-0.5 font-bold text-[var(--devdoc-muted)]">
                        {run.status}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[var(--devdoc-muted)]">
                      <span>Score: <strong className={getScoreColor(run.readinessScore)}>{run.readinessScore ?? "-"}</strong></span>
                      <span>{run.resultCount} issue(s)</span>
                    </div>
                    {isLoadingRunId === run.id ? (
                      <p className="mt-1 font-semibold text-[var(--devdoc-primary)]">Loading...</p>
                    ) : null}
                  </button>
                ))}
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}

export default ValidationEngine;
