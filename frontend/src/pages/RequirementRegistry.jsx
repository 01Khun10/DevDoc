import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import CreateRequirementForm from "../components/CreateRequirementForm";
import RequirementCard from "../components/RequirementCard";
import { RegistryControls, sortAndSearch } from "../components/RegistryControls";
import { Modal, SkeletonCard } from "../components/ui";
import useKeyboardNav from "../hooks/useKeyboardNav";
import { useNotify } from "../context/NotificationContext";
import { useProject } from "../context/ProjectContext";
import {
  useCreateRequirement,
  useDeleteRequirement,
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

const STATUS_OPTIONS = ["PROPOSED", "APPROVED", "IMPLEMENTED", "VERIFIED"];

function RequirementRegistry() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { project } = useProject();
  const { notify } = useNotify();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight") || "";
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [isBulkWorking, setIsBulkWorking] = useState(false);
  const { data: requirements = [], isLoading, error, refetch } = useRequirements(id);

  // Validation deep link: scroll the highlighted requirement into view with a 2.5s glow.
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
  useAuthGuard(error);
  const createMutation = useCreateRequirement(id);
  const updateMutation = useUpdateRequirement(id);
  const deleteMutation = useDeleteRequirement(id);
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
    let list = requirements;
    if (activeFilter === "FR") list = list.filter((r) => r.type === "FR");
    else if (activeFilter === "NFR") list = list.filter((r) => r.type === "NFR");
    else if (activeFilter === "HIGH") list = list.filter((r) => r.priority === "HIGH");
    else if (activeFilter === "APPROVED_VERIFIED")
      list = list.filter((r) => ["APPROVED", "VERIFIED"].includes(r.status));
    return sortAndSearch(list, { sort, search, withPriority: true });
  }, [activeFilter, requirements, sort, search]);

  async function handleDeleteRequirement(requirement) {
    if (!window.confirm(`Delete requirement ${requirement.code}?`)) return;
    try {
      await deleteMutation.mutateAsync(requirement.id);
      notify(`Requirement ${requirement.code} deleted.`, { tone: "success" });
    } catch (mutationError) {
      notify(mutationError.message || "Could not delete requirement.", { tone: "error" });
    }
  }

  const { focusedId } = useKeyboardNav(filteredRequirements, {
    onEdit: (requirement) =>
      document.getElementById(`artifact-${requirement.id}`)?.querySelector("input, textarea")?.focus(),
    onDelete: handleDeleteRequirement
  });

  async function handleCreateRequirement(input) {
    return createMutation.mutateAsync(input);
  }

  function handleRequirementCreated() {
    setActiveFilter("ALL");
  }

  async function handleUpdateRequirement(requirementId, input) {
    return updateMutation.mutateAsync({ requirementId, ...input });
  }

  function toggleSelected(requirementId) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(requirementId)) next.delete(requirementId);
      else next.add(requirementId);
      return next;
    });
  }

  const selectedRequirements = requirements.filter((r) => selectedIds.has(r.id));

  async function handleBulkStatus(status) {
    if (!status || isBulkWorking) return;
    setIsBulkWorking(true);
    try {
      // ponytail: serial per-item PUTs; batch endpoint if lists get long
      for (const requirement of selectedRequirements) {
        await updateMutation.mutateAsync({ requirementId: requirement.id, status });
      }
      notify(`${selectedRequirements.length} requirement(s) set to ${status}.`, { tone: "success" });
      setSelectedIds(new Set());
    } catch (mutationError) {
      notify(mutationError.message || "Bulk status change failed.", { tone: "error" });
    } finally {
      setIsBulkWorking(false);
    }
  }

  async function handleBulkDelete() {
    if (isBulkWorking) return;
    setIsBulkWorking(true);
    try {
      for (const requirement of selectedRequirements) {
        await deleteMutation.mutateAsync(requirement.id);
      }
      notify(`${selectedRequirements.length} requirement(s) deleted.`, { tone: "success" });
      setSelectedIds(new Set());
      setConfirmBulkDelete(false);
    } catch (mutationError) {
      notify(mutationError.message || "Bulk delete failed.", { tone: "error" });
    } finally {
      setIsBulkWorking(false);
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
          <span className="ml-2 hidden text-xs sm:inline" style={{ color: "var(--devdoc-muted)" }}>
            Tip: J/K to navigate, E to edit, D to delete.
          </span>
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-6">
        {isLoading ? (
          <div className="grid gap-3">
            <SkeletonCard lines={2} />
            <SkeletonCard lines={4} />
            <SkeletonCard lines={4} />
            <SkeletonCard lines={4} />
          </div>
        ) : (
          <>
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
              id="create-requirement"
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
              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="font-headline text-lg font-extrabold">Requirements</h2>
                  <p className="mt-1 text-sm" style={{ color: "var(--devdoc-muted)" }}>
                    Showing {filteredRequirements.length} of {requirements.length}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <RegistryControls
                    sort={sort}
                    onSortChange={setSort}
                    search={search}
                    onSearchChange={setSearch}
                    withPriority
                  />
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12l2 2 4-4" />
                    </svg>
                  </div>
                  <p className="font-headline text-lg font-extrabold">No requirements yet.</p>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6" style={{ color: "var(--devdoc-muted)" }}>
                    Start by capturing what the system must do. Use cases help you discover them — or add FRs and NFRs directly.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Link className="devdoc-button-secondary" to={`/projects/${id}/use-cases`}>
                      Browse Use Cases
                    </Link>
                    <a className="devdoc-gradient-button" href="#create-requirement">
                      Add Requirement
                    </a>
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
                  {filteredRequirements.map((requirement) => {
                    const isSelected = selectedIds.has(requirement.id);
                    return (
                      <div
                        key={requirement.id}
                        id={`artifact-${requirement.id}`}
                        className="group relative rounded-xl"
                        style={
                          focusedId === requirement.id
                            ? { outline: "2px solid var(--devdoc-primary)", outlineOffset: "3px" }
                            : undefined
                        }
                      >
                        <input
                          type="checkbox"
                          className={`absolute -left-7 top-6 h-4 w-4 cursor-pointer accent-[var(--devdoc-primary)] transition-opacity ${
                            isSelected || selectedIds.size > 0 ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                          }`}
                          checked={isSelected}
                          aria-label={`Select ${requirement.code}`}
                          onChange={() => toggleSelected(requirement.id)}
                        />
                        <RequirementCard
                          requirement={requirement}
                          onUpdate={handleUpdateRequirement}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <div
              className="mt-6 rounded-xl border px-5 py-4 text-sm"
              style={{ borderColor: "var(--devdoc-border)", color: "var(--devdoc-muted)" }}
            >
              Use the Traceability Matrix to link requirements to document sections after creating them.
            </div>
          </>
        )}
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 ? (
        <div
          className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-xl border px-4 py-2.5 shadow-xl"
          style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
        >
          <span className="text-sm font-bold">{selectedIds.size} selected</span>
          <select
            className="devdoc-select h-9 text-sm"
            value=""
            disabled={isBulkWorking}
            aria-label="Change status of selected"
            onChange={(event) => handleBulkStatus(event.target.value)}
          >
            <option value="" disabled>Change status →</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <button
            type="button"
            className="rounded-lg px-3 py-1.5 text-sm font-bold disabled:opacity-40"
            style={{ backgroundColor: "var(--devdoc-error-soft)", color: "var(--devdoc-error)" }}
            disabled={isBulkWorking}
            onClick={() => setConfirmBulkDelete(true)}
          >
            Delete selected
          </button>
          <button
            type="button"
            className="devdoc-icon-button h-7 w-7 text-xs"
            aria-label="Clear selection"
            onClick={() => setSelectedIds(new Set())}
          >
            ✕
          </button>
        </div>
      ) : null}

      <Modal
        isOpen={confirmBulkDelete}
        title={`Delete ${selectedIds.size} requirement(s)?`}
        onClose={() => setConfirmBulkDelete(false)}
        footer={
          <>
            <button className="devdoc-button-secondary" type="button" onClick={() => setConfirmBulkDelete(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="rounded-lg px-4 py-2 text-sm font-bold disabled:opacity-40"
              style={{ backgroundColor: "var(--devdoc-error)", color: "#ffffff" }}
              disabled={isBulkWorking}
              onClick={handleBulkDelete}
            >
              {isBulkWorking ? "Deleting..." : "Delete"}
            </button>
          </>
        }
      >
        <p className="text-sm" style={{ color: "var(--devdoc-muted)" }}>
          This permanently deletes the selected requirements and their traceability links:
        </p>
        <p className="mt-2 text-sm font-bold">
          {selectedRequirements.map((r) => r.code).join(", ")}
        </p>
      </Modal>
    </main>
  );
}

export default RequirementRegistry;
