import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNotify } from "../context/NotificationContext";
import useAuth from "../hooks/useAuth";
import { getProject } from "../services/projectService";
import {
  createTestCase,
  deleteTestCase,
  listTestCases,
  updateTestCase
} from "../services/testCaseService";

const STATUSES = ["DRAFT", "READY", "PASSED", "FAILED", "BLOCKED"];

const STATUS_COLORS = {
  PASSED: "var(--devdoc-success)",
  FAILED: "var(--devdoc-error)",
  BLOCKED: "var(--devdoc-warning)",
  READY: "var(--devdoc-info)",
  DRAFT: "var(--devdoc-muted)"
};

function TestCaseRegistry() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { notify } = useNotify();
  const [project, setProject] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorType, setErrorType] = useState("");
  const [form, setForm] = useState({ title: "", description: "", expectedResult: "" });
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
      const [loadedProject, loadedTestCases] = await Promise.all([
        getProject(id),
        listTestCases(id)
      ]);
      setProject(loadedProject);
      setTestCases(loadedTestCases);
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
      const created = await createTestCase(id, {
        title: form.title,
        description: form.description || null,
        expectedResult: form.expectedResult || null,
        status: "DRAFT"
      });
      setTestCases((cur) => [...cur, created].sort((a, b) => a.code.localeCompare(b.code)));
      setForm({ title: "", description: "", expectedResult: "" });
      notify(`Test case ${created.code} created.`, { tone: "success" });
    } catch (error) {
      if (handleRequestError(error)) return;
      setFormError(error.message || "Could not create test case.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStatusChange(testCase, status) {
    try {
      const updated = await updateTestCase(id, testCase.id, { status });
      setTestCases((cur) => cur.map((item) => (item.id === updated.id ? updated : item)));
    } catch (error) {
      if (handleRequestError(error)) return;
      notify(error.message || "Could not update test case.", { tone: "error" });
    }
  }

  async function handleDelete(testCase) {
    if (!window.confirm(`Delete test case ${testCase.code}?`)) return;
    setIsDeletingId(testCase.id);
    try {
      await deleteTestCase(id, testCase.id);
      setTestCases((cur) => cur.filter((item) => item.id !== testCase.id));
      notify("Test case removed.", { tone: "success" });
    } catch (error) {
      if (handleRequestError(error)) return;
      notify(error.message || "Could not remove test case.", { tone: "error" });
    } finally {
      setIsDeletingId("");
    }
  }

  if (isLoading) return <LoadingSpinner fullScreen label="Loading test cases..." />;

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
          <p className="font-headline text-xl font-extrabold">Could not load test cases</p>
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
        <h1 className="font-headline mt-1.5 text-2xl font-extrabold tracking-tight">Test Cases</h1>
        <p className="mt-1 text-sm leading-6" style={{ color: "var(--devdoc-muted)" }}>
          Define the test cases that verify your requirements, then link them in the Traceability Matrix.
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-6">
        <section
          className="mb-6 rounded-xl border p-5"
          style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
        >
          <h2 className="font-headline mb-4 text-base font-extrabold">Create test case</h2>
          <form className="grid gap-3" onSubmit={handleSubmit}>
            <input
              className="devdoc-input"
              maxLength={200}
              placeholder="Title (e.g. Login with valid credentials)"
              value={form.title}
              onChange={(e) => setForm((cur) => ({ ...cur, title: e.target.value }))}
            />
            <textarea
              className="devdoc-input min-h-[5rem]"
              maxLength={5000}
              placeholder="Steps / description (optional)"
              value={form.description}
              onChange={(e) => setForm((cur) => ({ ...cur, description: e.target.value }))}
            />
            <textarea
              className="devdoc-input min-h-[4rem]"
              maxLength={5000}
              placeholder="Expected result (optional)"
              value={form.expectedResult}
              onChange={(e) => setForm((cur) => ({ ...cur, expectedResult: e.target.value }))}
            />
            {formError ? (
              <p className="text-sm font-semibold" style={{ color: "var(--devdoc-error)" }}>{formError}</p>
            ) : null}
            <div>
              <button className="devdoc-gradient-button" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Creating..." : "Create test case"}
              </button>
            </div>
          </form>
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-headline text-lg font-extrabold">Test cases</h2>
            <span className="text-sm font-semibold" style={{ color: "var(--devdoc-muted)" }}>
              {testCases.length} total
            </span>
          </div>

          {testCases.length === 0 ? (
            <div
              className="rounded-xl border p-12 text-center"
              style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
            >
              <p className="font-headline text-lg font-extrabold">No test cases yet</p>
              <p className="mt-2 text-sm" style={{ color: "var(--devdoc-muted)" }}>
                Create your first test case above, then link it to a requirement with a verified_by link.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {testCases.map((testCase) => (
                <article
                  key={testCase.id}
                  className="rounded-xl border p-4"
                  style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: "var(--devdoc-primary)" }}>{testCase.code}</span>
                        <span
                          className="rounded-md px-2 py-0.5 text-xs font-bold uppercase"
                          style={{
                            backgroundColor: "var(--devdoc-surface-muted)",
                            border: "1px solid var(--devdoc-border)",
                            color: STATUS_COLORS[testCase.status] || "var(--devdoc-muted)"
                          }}
                        >
                          {testCase.status || "DRAFT"}
                        </span>
                      </div>
                      <h3 className="mt-2 text-sm font-semibold" style={{ color: "var(--devdoc-text)" }}>{testCase.title}</h3>
                      {testCase.description ? (
                        <p className="mt-1 text-sm leading-6" style={{ color: "var(--devdoc-muted)" }}>{testCase.description}</p>
                      ) : null}
                      {testCase.expectedResult ? (
                        <p className="mt-1 text-xs leading-5" style={{ color: "var(--devdoc-muted)" }}>
                          <span className="font-semibold">Expected:</span> {testCase.expectedResult}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <select
                        className="devdoc-input py-1.5 text-xs"
                        value={testCase.status || "DRAFT"}
                        onChange={(e) => handleStatusChange(testCase, e.target.value)}
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      <button
                        className="rounded-lg px-3 py-1.5 text-xs font-bold transition disabled:opacity-40"
                        style={{
                          border: "1px solid color-mix(in srgb, var(--devdoc-error) 35%, var(--devdoc-border))",
                          backgroundColor: "var(--devdoc-error-soft)",
                          color: "var(--devdoc-error)"
                        }}
                        disabled={isDeletingId === testCase.id}
                        type="button"
                        onClick={() => handleDelete(testCase)}
                      >
                        {isDeletingId === testCase.id ? "Removing..." : "Delete"}
                      </button>
                    </div>
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
          Use the Traceability Matrix (Requirements → Test Cases) to mark which requirement each test verifies.
        </div>
      </div>
    </main>
  );
}

export default TestCaseRegistry;
