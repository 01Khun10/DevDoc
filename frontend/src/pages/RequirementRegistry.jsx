import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CreateRequirementForm from "../components/CreateRequirementForm";
import LoadingSpinner from "../components/LoadingSpinner";
import RequirementCard from "../components/RequirementCard";
import { useProject } from "../context/ProjectContext";
import {
  useCreateRequirement,
  useRequirements,
  useUpdateRequirement
} from "../api/requirements";
import useAuthGuard from "../api/useAuthGuard";

const FILTERS = [
  ["ALL", "All"],
  ["FR", "Functional"],
  ["NFR", "Non-Functional"],
  ["HIGH", "High Priority"],
  ["APPROVED_VERIFIED", "Approved / Verified"]
];

function RequirementRegistry() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { project } = useProject();
  const [activeFilter, setActiveFilter] = useState("ALL");
  const { data: requirements = [], isLoading, error, refetch } = useRequirements(id);
  useAuthGuard(error);
  const createMutation = useCreateRequirement(id);
  const updateMutation = useUpdateRequirement(id);
  const errorType = error ? (error.status === 404 ? "not-found" : "load-error") : "";

  const summary = useMemo(
    () => ({
      total: requirements.length,
      fr: requirements.filter((r) => r.type === "FR").length,
      nfr: requirements.filter((r) => r.type === "NFR").length,
      highPriority: requirements.filter((r) => r.priority === "HIGH").length,
      approvedOrVerified: requirements.filter((r) => ["APPROVED", "VERIFIED"].includes(r.status)).length,
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

  async function handleCreateRequirement(input) {
    return createMutation.mutateAsync(input);
  }

  function handleRequirementCreated() {
    setActiveFilter("ALL");
  }

  async function handleUpdateRequirement(requirementId, input) {
    return updateMutation.mutateAsync({ requirementId, ...input });
  }

  if (isLoading) return <LoadingSpinner fullScreen label="Loading requirements..." />;

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
          <p className="font-headline text-xl font-extrabold">Could not load requirements</p>
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
        <h1 className="font-headline mt-1.5 text-2xl font-extrabold tracking-tight">Requirements Registry</h1>
        <p className="mt-1 text-sm leading-6" style={{ color: "var(--devdoc-muted)" }}>
          Capture functional and non-functional requirements, then link them to design, tests, and validation.
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-6">
        {/* Stats */}
        <div className="mb-6 grid gap-3 grid-cols-2 sm:grid-cols-5">
          {[
            { label: "Total", value: summary.total, color: "var(--devdoc-text)" },
            { label: "Functional", value: summary.fr, color: "var(--devdoc-primary)" },
            { label: "Non-Functional", value: summary.nfr, color: "var(--devdoc-info)" },
            { label: "High Priority", value: summary.highPriority, color: "var(--devdoc-warning)" },
            { label: "Approved / Verified", value: summary.approvedOrVerified, color: "var(--devdoc-success)" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border p-4 text-center"
              style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
            >
              <p className="font-headline text-2xl font-extrabold" style={{ color: stat.color }}>
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-semibold" style={{ color: "var(--devdoc-muted)" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Create form */}
        <section
          className="mb-6 rounded-xl border p-5"
          style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
        >
          <h2 className="font-headline mb-4 text-base font-extrabold">Create requirement</h2>
          <CreateRequirementForm
            onCreate={handleCreateRequirement}
            onCreated={handleRequirementCreated}
          />
        </section>

        {/* Filter + list */}
        <section>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-headline text-lg font-extrabold">Requirements</h2>
              <p className="mt-1 text-sm" style={{ color: "var(--devdoc-muted)" }}>
                Showing {filteredRequirements.length} of {requirements.length}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {FILTERS.map(([value, label]) => (
                <button
                  key={value}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150"
                  style={{
                    backgroundColor: activeFilter === value ? "var(--devdoc-primary)" : "var(--devdoc-surface-muted)",
                    color: activeFilter === value ? "#ffffff" : "var(--devdoc-muted)",
                    border: `1px solid ${activeFilter === value ? "var(--devdoc-primary)" : "var(--devdoc-border)"}`,
                  }}
                  type="button"
                  onClick={() => setActiveFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {requirements.length === 0 ? (
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="font-headline text-lg font-extrabold">No requirements yet</p>
              <p className="mt-2 text-sm" style={{ color: "var(--devdoc-muted)" }}>
                Start by creating your first FR or NFR above.
              </p>
              <div className="mx-auto mt-6 grid max-w-sm gap-3 sm:grid-cols-2">
                <div
                  className="rounded-xl border p-3 text-left text-xs"
                  style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface-muted)" }}
                >
                  <p className="font-bold" style={{ color: "var(--devdoc-primary)" }}>FR example</p>
                  <p className="mt-1" style={{ color: "var(--devdoc-muted)" }}>User can create a project.</p>
                </div>
                <div
                  className="rounded-xl border p-3 text-left text-xs"
                  style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface-muted)" }}
                >
                  <p className="font-bold" style={{ color: "var(--devdoc-text)" }}>NFR example</p>
                  <p className="mt-1" style={{ color: "var(--devdoc-muted)" }}>Dashboard loads in under 2s.</p>
                </div>
              </div>
            </div>
          ) : filteredRequirements.length === 0 ? (
            <div
              className="rounded-xl border p-8 text-center text-sm"
              style={{ borderColor: "var(--devdoc-border)", color: "var(--devdoc-muted)" }}
            >
              No requirements match this filter.
            </div>
          ) : (
            <div className="grid gap-3">
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

        <div
          className="mt-6 rounded-xl border px-5 py-4 text-sm"
          style={{ borderColor: "var(--devdoc-border)", color: "var(--devdoc-muted)" }}
        >
          Use the Traceability Matrix to link requirements to document sections after creating them.
        </div>
      </div>
    </main>
  );
}

export default RequirementRegistry;
