import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CreateRequirementForm from "../components/CreateRequirementForm";
import LoadingSpinner from "../components/LoadingSpinner";
import RequirementCard from "../components/RequirementCard";
import useAuth from "../hooks/useAuth";
import { getProject } from "../services/projectService";
import {
  createRequirement,
  listRequirements,
  updateRequirement
} from "../services/requirementService";

const FILTERS = [
  ["ALL", "All"],
  ["FR", "Functional"],
  ["NFR", "Non-Functional"],
  ["HIGH", "High Priority"],
  ["APPROVED_VERIFIED", "Approved / Verified"]
];

function StatCard({ label, value, accent = false }) {
  return (
    <div className="devdoc-card-border p-4">
      <p className="devdoc-label">{label}</p>
      <p className={`mt-2 font-headline text-3xl font-extrabold ${accent ? "text-[var(--devdoc-primary)]" : "text-[var(--devdoc-text)]"}`}>
        {value}
      </p>
    </div>
  );
}

function RequirementRegistry() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [project, setProject] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorType, setErrorType] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");

  const summary = useMemo(
    () => ({
      total: requirements.length,
      fr: requirements.filter((r) => r.type === "FR").length,
      nfr: requirements.filter((r) => r.type === "NFR").length,
      highPriority: requirements.filter((r) => r.priority === "HIGH").length,
      approvedOrVerified: requirements.filter((r) =>
        ["APPROVED", "VERIFIED"].includes(r.status)
      ).length
    }),
    [requirements]
  );

  const filteredRequirements = useMemo(() => {
    if (activeFilter === "FR") return requirements.filter((r) => r.type === "FR");
    if (activeFilter === "NFR") return requirements.filter((r) => r.type === "NFR");
    if (activeFilter === "HIGH") return requirements.filter((r) => r.priority === "HIGH");
    if (activeFilter === "APPROVED_VERIFIED")
      return requirements.filter((r) => ["APPROVED", "VERIFIED"].includes(r.status));
    return requirements;
  }, [activeFilter, requirements]);

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
      const [loadedProject, loadedRequirements] = await Promise.all([
        getProject(id),
        listRequirements(id)
      ]);
      setProject(loadedProject);
      setRequirements(loadedRequirements);
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

  async function handleCreateRequirement(input) {
    return createRequirement(id, input);
  }

  async function handleRequirementCreated() {
    const loaded = await listRequirements(id);
    setRequirements(loaded);
    setActiveFilter("ALL");
  }

  async function handleUpdateRequirement(requirementId, input) {
    const updated = await updateRequirement(id, requirementId, input);
    setRequirements((cur) => cur.map((r) => (r.id === updated.id ? updated : r)));
    return updated;
  }

  if (isLoading) return <LoadingSpinner fullScreen label="Loading requirements..." />;

  if (errorType === "not-found") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--devdoc-bg)] px-6">
        <div className="devdoc-card-border max-w-md p-8 text-center">
          <p className="font-headline text-xl font-extrabold text-[var(--devdoc-text)]">Project not found</p>
          <button className="devdoc-gradient-button mt-6" onClick={() => navigate("/dashboard")}>
            Back to dashboard
          </button>
        </div>
      </main>
    );
  }

  if (errorType === "load-error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--devdoc-bg)] px-6">
        <div className="devdoc-card-border max-w-md p-8 text-center">
          <p className="font-headline text-xl font-extrabold text-[var(--devdoc-text)]">Could not load requirements</p>
          <p className="mt-2 text-sm text-[var(--devdoc-muted)]">Check your connection and try again.</p>
          <button className="devdoc-gradient-button mt-6" onClick={loadPage}>Retry</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--devdoc-bg)] px-6 py-8 text-[var(--devdoc-text)]">
      <section className="mx-auto max-w-5xl">

        {/* Page header */}
        <div className="mb-8">
          <p className="devdoc-label text-[var(--devdoc-primary)]">{project.name}</p>
          <h1 className="font-headline mt-2 text-4xl font-extrabold tracking-tight">
            Requirements Registry
          </h1>
          <p className="mt-2 text-sm leading-6 text-[var(--devdoc-muted)]">
            Capture functional and non-functional requirements, then link them to design, tests, and validation.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Total" value={summary.total} />
          <StatCard label="Functional" value={summary.fr} />
          <StatCard label="Non-Functional" value={summary.nfr} />
          <StatCard label="High Priority" value={summary.highPriority} />
          <StatCard label="Approved / Verified" value={summary.approvedOrVerified} accent />
        </div>

        {/* Create form */}
        <section className="mb-8">
          <h2 className="mb-4 font-headline text-xl font-extrabold">Create requirement</h2>
          <CreateRequirementForm
            onCreate={handleCreateRequirement}
            onCreated={handleRequirementCreated}
          />
        </section>

        {/* Filter + list */}
        <section>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-headline text-xl font-extrabold">Requirements</h2>
              <p className="mt-1 text-sm text-[var(--devdoc-muted)]">
                Showing {filteredRequirements.length} of {requirements.length}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map(([value, label]) => (
                <button
                  key={value}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
                    activeFilter === value
                      ? "bg-[var(--devdoc-primary)] text-white ring-[var(--devdoc-primary)]"
                      : "bg-[var(--devdoc-surface)] text-[var(--devdoc-muted)] ring-[var(--devdoc-border)] hover:text-[var(--devdoc-text)] hover:ring-[var(--devdoc-border-strong)]"
                  }`}
                  type="button"
                  onClick={() => setActiveFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {requirements.length === 0 ? (
            <div className="devdoc-card-border p-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--devdoc-border)] bg-[var(--devdoc-primary-soft)] text-[var(--devdoc-primary)]">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="font-headline text-lg font-extrabold text-[var(--devdoc-text)]">No requirements yet</p>
              <p className="mt-2 text-sm text-[var(--devdoc-muted)]">
                Start by creating your first FR or NFR above.
              </p>
              <div className="mx-auto mt-6 grid max-w-md gap-3 sm:grid-cols-2">
                <div className="devdoc-inset text-left">
                  <p className="font-bold text-[var(--devdoc-primary)]">FR example</p>
                  <p className="mt-1 text-sm text-[var(--devdoc-muted)]">User can create a project.</p>
                </div>
                <div className="devdoc-inset text-left">
                  <p className="font-bold text-[var(--devdoc-text)]">NFR example</p>
                  <p className="mt-1 text-sm text-[var(--devdoc-muted)]">Dashboard loads in under 2 seconds.</p>
                </div>
              </div>
            </div>
          ) : filteredRequirements.length === 0 ? (
            <div className="devdoc-card-border p-8 text-center text-sm text-[var(--devdoc-muted)]">
              No requirements match this filter.
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredRequirements.map((requirement) => (
                <RequirementCard
                  key={requirement.id}
                  requirement={requirement}
                  onUpdate={handleUpdateRequirement}
                />
              ))}
            </div>
          )}
        </section>

        <div className="devdoc-card-border mt-8 px-5 py-4 text-sm text-[var(--devdoc-muted)]">
          Use the Traceability Matrix to link requirements to document sections after creating them.
        </div>
      </section>
    </main>
  );
}

export default RequirementRegistry;
