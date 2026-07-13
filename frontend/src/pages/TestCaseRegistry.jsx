import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import InlineBadgeSelect from "../components/InlineBadgeSelect";
import { RegistryControls, sortAndSearch } from "../components/RegistryControls";
import { SkeletonCard } from "../components/ui";
import { useNotify } from "../context/NotificationContext";
import { useProject } from "../context/ProjectContext";
import {
  useCreateTestCase,
  useDeleteTestCase,
  useTestCases,
  useUpdateTestCase
} from "../api/testCases";
import useAuthGuard from "../api/useAuthGuard";

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
  const { project } = useProject();
  const { notify } = useNotify();
  const [form, setForm] = useState({ title: "", description: "", expectedResult: "" });
  const [formError, setFormError] = useState("");
  const [isDeletingId, setIsDeletingId] = useState("");
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight") || "";
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const { data: testCases = [], isLoading, error, refetch } = useTestCases(id);
  const createMutation = useCreateTestCase(id);
  const updateMutation = useUpdateTestCase(id);
  const deleteMutation = useDeleteTestCase(id);
  useAuthGuard(error, createMutation.error, updateMutation.error, deleteMutation.error);
  const errorType = error ? (error.status === 404 ? "not-found" : "load-error") : "";
  const isSubmitting = createMutation.isPending;

  const visibleTestCases = useMemo(
    () => sortAndSearch(testCases, { sort, search }),
    [testCases, sort, search]
  );

  // Validation deep link: scroll the highlighted test case into view with a 2.5s glow.
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
        expectedResult: form.expectedResult || null,
        status: "DRAFT"
      });
      setForm({ title: "", description: "", expectedResult: "" });
      notify(`Test case ${created.code} created.`, { tone: "success" });
    } catch (mutationError) {
      setFormError(mutationError.message || "Could not create test case.");
    }
  }

  async function handleStatusChange(testCase, status) {
    try {
      await updateMutation.mutateAsync({ testCaseId: testCase.id, status });
    } catch (mutationError) {
      notify(mutationError.message || "Could not update test case.", { tone: "error" });
    }
  }

  async function handleDelete(testCase) {
    if (!window.confirm(`Delete test case ${testCase.code}?`)) return;
    setIsDeletingId(testCase.id);
    try {
      await deleteMutation.mutateAsync(testCase.id);
      notify("Test case removed.", { tone: "success" });
    } catch (mutationError) {
      notify(mutationError.message || "Could not remove test case.", { tone: "error" });
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
          <p className="font-headline text-xl font-extrabold">Could not load test cases</p>
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
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-headline text-lg font-extrabold">Test cases</h2>
              <span className="text-sm font-semibold" style={{ color: "var(--devdoc-muted)" }}>
                Showing {visibleTestCases.length} of {testCases.length}
              </span>
            </div>
            <RegistryControls sort={sort} onSortChange={setSort} search={search} onSearchChange={setSearch} />
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
              {visibleTestCases.map((testCase) => (
                <article
                  key={testCase.id}
                  id={`artifact-${testCase.id}`}
                  className="rounded-xl border p-4"
                  style={{
                    borderColor: "var(--devdoc-border)",
                    backgroundColor: "var(--devdoc-surface)"
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: "var(--devdoc-primary)" }}>{testCase.code}</span>
                        <InlineBadgeSelect
                          value={testCase.status || "DRAFT"}
                          options={STATUSES}
                          badgeStyle={{ color: STATUS_COLORS[testCase.status] || "var(--devdoc-muted)" }}
                          onSelect={(next) => handleStatusChange(testCase, next)}
                        />
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
