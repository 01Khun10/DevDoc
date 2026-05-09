import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
  if (!value) {
    return "Not completed";
  }

  return new Date(value).toLocaleString();
}

function getScoreStyle(score) {
  if (score >= 80) {
    return "text-emerald-700";
  }

  if (score >= 50) {
    return "text-amber-700";
  }

  return "text-red-700";
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
      if (handleRequestError(error)) {
        return;
      }

      setErrorType(error.status === 404 ? "not-found" : "load-error");
    } finally {
      setIsLoading(false);
    }
  }, [handleRequestError, id]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  async function handleRunValidation() {
    setIsRunning(true);
    setRunError("");

    try {
      const validationRun = await runValidation(id);
      setActiveRun(validationRun);
      await loadHistory();
    } catch (error) {
      if (handleRequestError(error)) {
        return;
      }

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
      if (handleRequestError(error)) {
        return;
      }

      setRunError(error.message || "Could not load validation run.");
    } finally {
      setIsLoadingRunId("");
    }
  }

  const groupedResults = useMemo(() => {
    const results = activeRun?.results || [];

    return severityOrder.map((severity) => ({
      severity,
      results: results.filter((result) => result.severity === severity)
    }));
  }, [activeRun]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-slate-900">
        <p className="text-sm font-medium text-slate-600">Loading validation...</p>
      </main>
    );
  }

  if (errorType === "not-found") {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
        <section className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-lg font-semibold text-slate-950">Project not found.</p>
          <Link
            className="mt-5 inline-flex text-sm font-semibold text-teal-700 hover:text-teal-800"
            to="/dashboard"
          >
            Back to dashboard
          </Link>
        </section>
      </main>
    );
  }

  if (errorType === "load-error") {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
        <section className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-lg font-semibold text-slate-950">
            Could not load validation. Check your connection and try again.
          </p>
          <button
            className="mt-5 rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
            type="button"
            onClick={loadPage}
          >
            Retry
          </button>
        </section>
      </main>
    );
  }

  const readinessScore = activeRun?.readinessScore ?? null;
  const resultCount = activeRun?.results?.length || 0;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              className="text-sm font-semibold text-teal-700 hover:text-teal-800"
              to={`/projects/${id}`}
            >
              Back to project workspace
            </Link>
            <h1 className="mt-3 text-3xl font-bold">Doc-Linter Validation</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Project: <span className="font-semibold text-slate-800">{project.name}</span>
            </p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Run basic checks for missing documents, empty required sections, unlinked
              requirements, and incomplete documents.
            </p>
          </div>
          <button
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
            type="button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Run project checks</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  This creates a saved validation run and stores each issue as a validation result.
                </p>
              </div>
              <button
                className="rounded-md bg-teal-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                type="button"
                disabled={isRunning}
                onClick={handleRunValidation}
              >
                {isRunning ? "Running..." : "Run Validation"}
              </button>
            </div>
            {runError ? (
              <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {runError}
              </p>
            ) : null}
          </div>

          <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">Readiness score</p>
            {readinessScore === null ? (
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Run validation to calculate this project&apos;s readiness.
              </p>
            ) : (
              <>
                <p className={`mt-3 text-4xl font-bold ${getScoreStyle(readinessScore)}`}>
                  {readinessScore}
                  <span className="text-xl text-slate-500">/100</span>
                </p>
                <p className="mt-2 text-sm text-slate-600">{resultCount} issue(s) found</p>
              </>
            )}
          </aside>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-950">Validation results</h2>
              {activeRun ? (
                <span className="text-sm text-slate-600">
                  Completed: {formatDateTime(activeRun.completedAt)}
                </span>
              ) : null}
            </div>

            {!activeRun ? (
              <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-sm leading-6 text-slate-600 shadow-sm">
                Run validation or open a previous run to see Doc-Linter results.
              </div>
            ) : null}

            {activeRun && resultCount === 0 ? (
              <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-8 text-sm font-medium text-emerald-800 shadow-sm">
                No issues found. This project currently passes the basic checks.
              </div>
            ) : null}

            {activeRun && resultCount > 0 ? (
              <div className="mt-4 grid gap-6">
                {groupedResults.map((group) =>
                  group.results.length > 0 ? (
                    <section key={group.severity}>
                      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">
                        {group.severity}
                      </h3>
                      <div className="mt-3 grid gap-3">
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

          <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-950">Run history</h2>
              <span className="text-sm text-slate-500">{validationRuns.length} saved</span>
            </div>

            {validationRuns.length === 0 ? (
              <p className="mt-4 text-sm leading-6 text-slate-600">
                No validation runs yet. Run validation to create the first saved result.
              </p>
            ) : (
              <div className="mt-4 grid gap-3">
                {validationRuns.map((validationRun) => (
                  <button
                    key={validationRun.id}
                    className="rounded-md border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-teal-300 hover:bg-teal-50"
                    type="button"
                    onClick={() => handleSelectRun(validationRun.id)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-slate-950">
                        {formatDateTime(validationRun.startedAt)}
                      </span>
                      <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-bold text-slate-700">
                        {validationRun.status}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                      <span>
                        Score:{" "}
                        <strong className="text-slate-900">
                          {validationRun.readinessScore ?? "Pending"}
                        </strong>
                      </span>
                      <span>{validationRun.resultCount} issue(s)</span>
                    </div>
                    {isLoadingRunId === validationRun.id ? (
                      <p className="mt-2 text-xs font-semibold text-teal-700">Loading...</p>
                    ) : null}
                  </button>
                ))}
              </div>
            )}
          </aside>
        </section>
      </section>
    </main>
  );
}

export default ValidationEngine;
