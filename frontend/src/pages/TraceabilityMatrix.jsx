import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { SkeletonCard } from "../components/ui";
import TraceabilityGrid from "../components/TraceabilityGrid";
import TraceabilityGraph from "../components/TraceabilityGraph";
import TraceabilityLinkForm from "../components/TraceabilityLinkForm";
import TraceabilityLinkList from "../components/TraceabilityLinkList";
import SuggestedLinksPanel from "../components/SuggestedLinksPanel";
import { useNotify } from "../context/NotificationContext";
import { useProject } from "../context/ProjectContext";
import {
  useCreateTraceabilityLink,
  useDeleteTraceabilityLink,
  useTraceabilityLinks,
  useTraceabilityOptions,
  useVerifyTraceabilityLink,
} from "../api/traceability";
import useAuthGuard from "../api/useAuthGuard";

const TRACEABILITY_MODES = {
  BUSINESS_OBJECTIVE_USE_CASE: {
    key: "BUSINESS_OBJECTIVE_USE_CASE",
    label: "Objectives to Use Cases",
    sourceType: "BUSINESS_OBJECTIVE",
    targetType: "USE_CASE",
    linkType: "initiates",
    sourceLabel: "Business Objectives",
    targetLabel: "Use Cases",
    sourceKind: "businessObjective",
    targetKind: "useCase",
    explanation: "Link business objectives to the use cases they initiate.",
  },
  USE_CASE_REQUIREMENT: {
    key: "USE_CASE_REQUIREMENT",
    label: "Use Cases to Requirements",
    sourceType: "USE_CASE",
    targetType: "REQUIREMENT",
    linkType: "covers",
    sourceLabel: "Use Cases",
    targetLabel: "Requirements",
    sourceKind: "useCase",
    targetKind: "requirement",
    explanation: "Link use cases to the requirements they describe or justify.",
  },
  USE_CASE_DOCUMENT_SECTION: {
    key: "USE_CASE_DOCUMENT_SECTION",
    label: "Use Cases to Sections",
    sourceType: "USE_CASE",
    targetType: "DOCUMENT_SECTION",
    linkType: "described_by",
    sourceLabel: "Use Cases",
    targetLabel: "Document Sections",
    sourceKind: "useCase",
    targetKind: "documentSection",
    explanation: "Link use cases to the document sections where they are explained.",
  },
  REQUIREMENT_DOCUMENT_SECTION: {
    key: "REQUIREMENT_DOCUMENT_SECTION",
    label: "Requirements to Sections",
    sourceType: "REQUIREMENT",
    targetType: "DOCUMENT_SECTION",
    linkType: "described_by",
    sourceLabel: "Requirements",
    targetLabel: "Document Sections",
    sourceKind: "requirement",
    targetKind: "documentSection",
    explanation: "Link requirements to the document sections that describe them.",
  },
  REQUIREMENT_DESIGN_ELEMENT: {
    key: "REQUIREMENT_DESIGN_ELEMENT",
    label: "Requirements to Design Elements",
    sourceType: "REQUIREMENT",
    targetType: "DESIGN_ELEMENT",
    linkType: "implemented_by",
    sourceLabel: "Requirements",
    targetLabel: "Design Elements",
    sourceKind: "requirement",
    targetKind: "designElement",
    explanation: "Link requirements to the design elements that implement them.",
  },
  REQUIREMENT_TEST_CASE: {
    key: "REQUIREMENT_TEST_CASE",
    label: "Requirements to Test Cases",
    sourceType: "REQUIREMENT",
    targetType: "TEST_CASE",
    linkType: "verified_by",
    sourceLabel: "Requirements",
    targetLabel: "Test Cases",
    sourceKind: "requirement",
    targetKind: "testCase",
    explanation: "Link requirements to the test cases that verify them.",
  },
};

const MODE_ORDER = [
  "BUSINESS_OBJECTIVE_USE_CASE",
  "USE_CASE_REQUIREMENT",
  "USE_CASE_DOCUMENT_SECTION",
  "REQUIREMENT_DOCUMENT_SECTION",
  "REQUIREMENT_DESIGN_ELEMENT",
  "REQUIREMENT_TEST_CASE",
];

function getDefaultModeKey(useCases) {
  return useCases.length > 0 ? "USE_CASE_REQUIREMENT" : "REQUIREMENT_DOCUMENT_SECTION";
}

function getItemsByKind(kind, options) {
  if (kind === "businessObjective") return options.businessObjectives;
  if (kind === "useCase") return options.useCases;
  if (kind === "requirement") return options.requirements;
  if (kind === "designElement") return options.designElements;
  if (kind === "testCase") return options.testCases;
  return options.documentSections;
}

function getMissingMessage(kind) {
  if (kind === "businessObjective") return "Create business objectives before linking this traceability view.";
  if (kind === "useCase") return "Create use cases before linking this traceability view.";
  if (kind === "requirement") return "Create requirements before linking this traceability view.";
  if (kind === "designElement") return "Create design elements before linking this traceability view.";
  if (kind === "testCase") return "Create test cases before linking this traceability view.";
  return "Create a document before linking this traceability view.";
}

function TraceabilityMatrix() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { project } = useProject();
  const { notify } = useNotify();
  const [searchParams] = useSearchParams();
  // Validation deep link: ?mode=<MODE_KEY>&source=<id> lands in the builder
  // with the offending source preselected.
  const paramMode = searchParams.get("mode");
  const paramSource = searchParams.get("source") || "";
  const [activeTab, setActiveTab] = useState(paramSource ? "builder" : "grid");
  const [modeKey, setModeKey] = useState(
    paramMode && TRACEABILITY_MODES[paramMode] ? paramMode : ""
  );
  const [selectedSourceId, setSelectedSourceId] = useState(paramSource);
  const [createError, setCreateError] = useState("");
  const [processingTargetId, setProcessingTargetId] = useState("");
  const [isDeletingId, setIsDeletingId] = useState("");
  const [isVerifyingId, setIsVerifyingId] = useState("");

  const optionsQuery = useTraceabilityOptions(id);
  const linksQuery = useTraceabilityLinks(id);
  useAuthGuard(optionsQuery.error, linksQuery.error);
  const createMutation = useCreateTraceabilityLink(id);
  const deleteMutation = useDeleteTraceabilityLink(id);
  const verifyMutation = useVerifyTraceabilityLink(id);

  const isLoading = optionsQuery.isLoading || linksQuery.isLoading;
  const loadError = optionsQuery.error || linksQuery.error;
  const errorType = loadError ? (loadError.status === 404 ? "not-found" : "load-error") : "";
  const businessObjectives = optionsQuery.data?.businessObjectives || [];
  const useCases = optionsQuery.data?.useCases || [];
  const requirements = optionsQuery.data?.requirements || [];
  const documentSections = optionsQuery.data?.documentSections || [];
  const designElements = optionsQuery.data?.designElements || [];
  const testCases = optionsQuery.data?.testCases || [];
  const links = linksQuery.data || [];

  const activeMode =
    TRACEABILITY_MODES[modeKey || getDefaultModeKey(useCases)] ||
    TRACEABILITY_MODES.REQUIREMENT_DOCUMENT_SECTION;
  const options = useMemo(
    () => ({ businessObjectives, useCases, requirements, documentSections, designElements, testCases }),
    [businessObjectives, designElements, documentSections, requirements, testCases, useCases]
  );
  const sourceItems = getItemsByKind(activeMode.sourceKind, options);
  const targetItems = getItemsByKind(activeMode.targetKind, options);
  const modeLinks = useMemo(
    () =>
      links.filter(
        (link) =>
          link.sourceType === activeMode.sourceType &&
          link.targetType === activeMode.targetType &&
          link.linkType === activeMode.linkType
      ),
    [activeMode, links]
  );
  const linkedSourceIds = useMemo(
    () => new Set(modeLinks.map((link) => link.sourceId)),
    [modeLinks]
  );
  const linkedSourceCount = sourceItems.filter((source) => linkedSourceIds.has(source.id)).length;
  const unlinkedSourceCount = sourceItems.length - linkedSourceCount;

  function handleModeChange(nextModeKey) {
    setModeKey(nextModeKey);
    setSelectedSourceId("");
    setCreateError("");
  }

  async function handleDelete(linkId, opts = {}) {
    if (!opts.skipConfirm && !window.confirm("Remove this traceability link?")) return false;
    setIsDeletingId(linkId);
    setCreateError("");
    try {
      await deleteMutation.mutateAsync(linkId);
      notify("Traceability link removed.", { tone: "success" });
      return true;
    } catch (error) {
      setCreateError(error.message || "Could not remove traceability link.");
      return false;
    } finally {
      setIsDeletingId("");
    }
  }

  async function handleVerify(linkId) {
    setIsVerifyingId(linkId);
    setCreateError("");
    try {
      await verifyMutation.mutateAsync(linkId);
      notify("Traceability link re-verified.", { tone: "success" });
    } catch (error) {
      setCreateError(error.message || "Could not re-verify traceability link.");
    } finally {
      setIsVerifyingId("");
    }
  }

  // Grid cells toggle without confirmation; the update is optimistic and reversible.
  async function handleToggleCell(source, target) {
    const cellKey = `${source.id}:${target.id}`;
    if (processingTargetId) return;
    const existingLink =
      modeLinks.find((link) => link.sourceId === source.id && link.targetId === target.id) || null;
    setProcessingTargetId(cellKey);
    setCreateError("");
    try {
      if (existingLink) {
        await deleteMutation.mutateAsync(existingLink.id);
      } else {
        await createMutation.mutateAsync({
          sourceType: activeMode.sourceType,
          sourceId: source.id,
          targetType: activeMode.targetType,
          targetId: target.id,
          linkType: activeMode.linkType,
        });
      }
    } catch (error) {
      setCreateError(error.message || "Could not update traceability link.");
    } finally {
      setProcessingTargetId("");
    }
  }

  async function handleToggleLink(target) {
    if (!selectedSourceId || processingTargetId) return;
    const existingLink =
      modeLinks.find((link) => link.sourceId === selectedSourceId && link.targetId === target.id) || null;
    setProcessingTargetId(target.id);
    setCreateError("");
    try {
      if (existingLink) {
        if (!window.confirm("Remove this traceability link?")) return;
        await deleteMutation.mutateAsync(existingLink.id);
        notify("Traceability link removed.", { tone: "success" });
        return;
      }
      await createMutation.mutateAsync({
        sourceType: activeMode.sourceType,
        sourceId: selectedSourceId,
        targetType: activeMode.targetType,
        targetId: target.id,
        linkType: activeMode.linkType,
      });
      notify("Traceability link added.", { tone: "success" });
    } catch (error) {
      setCreateError(error.message || "Could not update traceability link.");
    } finally {
      setProcessingTargetId("");
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen px-6 py-8" style={{ backgroundColor: "var(--devdoc-bg)" }}>
        <div className="mx-auto grid max-w-6xl gap-3">
          <SkeletonCard lines={2} />
          <SkeletonCard lines={5} />
        </div>
      </main>
    );
  }

  const hasAnyArtifact =
    businessObjectives.length > 0 ||
    useCases.length > 0 ||
    requirements.length > 0 ||
    documentSections.length > 0 ||
    designElements.length > 0 ||
    testCases.length > 0;

  if (!errorType && !hasAnyArtifact) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6" style={{ backgroundColor: "var(--devdoc-bg)", color: "var(--devdoc-text)" }}>
        <div className="devdoc-card-border w-full max-w-2xl p-10 text-center">
          <h1 className="font-headline text-2xl font-extrabold">Build your traceability chain</h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6" style={{ color: "var(--devdoc-muted)" }}>
            Nothing to link yet. Follow these steps, then come back to connect everything.
          </p>
          <div className="mt-8 flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-0">
            {[
              ["1", "Add use cases", `/projects/${id}/use-cases`],
              ["2", "Add requirements", `/projects/${id}/requirements`],
              ["3", "Link them here", null]
            ].map(([step, label, href], index) => (
              <div key={step} className="flex items-center">
                {index > 0 ? (
                  <span className="mx-3 hidden text-lg sm:inline" style={{ color: "var(--devdoc-muted)" }}>→</span>
                ) : null}
                {href ? (
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition hover:-translate-y-0.5"
                    style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
                    onClick={() => navigate(href)}
                  >
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-black"
                      style={{ backgroundColor: "var(--devdoc-primary-soft)", color: "var(--devdoc-primary)" }}
                    >
                      {step}
                    </span>
                    {label}
                  </button>
                ) : (
                  <div
                    className="flex items-center gap-2 rounded-xl border border-dashed px-4 py-3 text-sm font-bold"
                    style={{ borderColor: "var(--devdoc-border)", color: "var(--devdoc-muted)" }}
                  >
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-black"
                      style={{ backgroundColor: "var(--devdoc-surface-muted)" }}
                    >
                      {step}
                    </span>
                    {label}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

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
          <p className="font-headline text-xl font-extrabold" style={{ color: "var(--devdoc-text)" }}>Could not load traceability</p>
          <p className="mt-2 text-sm" style={{ color: "var(--devdoc-muted)" }}>Check your connection and try again.</p>
          <button
            className="devdoc-gradient-button mt-6"
            onClick={() => {
              optionsQuery.refetch();
              linksQuery.refetch();
            }}
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  const missingSourceMessage = sourceItems.length === 0 ? getMissingMessage(activeMode.sourceKind) : "";
  const missingTargetMessage = targetItems.length === 0 ? getMissingMessage(activeMode.targetKind) : "";
  const canBuildLinks = sourceItems.length > 0 && targetItems.length > 0;

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
        <h1 className="font-headline mt-1.5 text-2xl font-extrabold tracking-tight">Traceability Matrix</h1>
        <p className="mt-1 max-w-3xl text-sm leading-6" style={{ color: "var(--devdoc-muted)" }}>
          Select a relationship view, pick a source item, then click targets to link or unlink. Traceability helps verify documentation coverage.
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Mode selector */}
        <div
          className="mb-5 rounded-xl border p-4"
          style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
        >
          <p className="devdoc-label mb-3">Relationship view</p>
          <div className="flex flex-wrap gap-2">
            {MODE_ORDER.map((key) => {
              const mode = TRACEABILITY_MODES[key];
              const isActive = mode.key === activeMode.key;
              return (
                <button
                  key={mode.key}
                  className="rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150"
                  style={{
                    backgroundColor: isActive ? "var(--devdoc-primary)" : "var(--devdoc-surface-muted)",
                    color: isActive ? "#ffffff" : "var(--devdoc-text-secondary)",
                    border: `1px solid ${isActive ? "var(--devdoc-primary)" : "var(--devdoc-border)"}`,
                    boxShadow: isActive ? "0 1px 4px rgba(99,102,241,0.25)" : "none",
                  }}
                  type="button"
                  onClick={() => handleModeChange(mode.key)}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-sm" style={{ color: "var(--devdoc-muted)" }}>{activeMode.explanation}</p>
        </div>

        {/* View tabs */}
        <div
          className="mb-5 flex gap-1 rounded-xl border p-1"
          style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
          role="tablist"
        >
          {[
            ["grid", "Grid"],
            ["builder", "Builder"],
            ["graph", "Graph"],
            ["audit", "Audit"],
          ].map(([key, label]) => (
            <button
              key={key}
              className="flex-1 rounded-lg px-4 py-2 text-sm font-bold transition"
              style={{
                backgroundColor: activeTab === key ? "var(--devdoc-primary)" : "transparent",
                color: activeTab === key ? "#ffffff" : "var(--devdoc-text-secondary)",
              }}
              type="button"
              role="tab"
              aria-selected={activeTab === key}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          {[
            { label: `Total ${activeMode.sourceLabel.toLowerCase()}`, value: sourceItems.length, color: "var(--devdoc-text)" },
            { label: "Linked sources", value: linkedSourceCount, color: "var(--devdoc-success)" },
            { label: "Unlinked sources", value: unlinkedSourceCount, color: unlinkedSourceCount > 0 ? "var(--devdoc-warning)" : "var(--devdoc-muted)" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border p-4"
              style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
            >
              <p className="devdoc-label">{stat.label}</p>
              <p className="mt-2 font-headline text-2xl font-extrabold" style={{ color: stat.color }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Suggested links (phase 11) */}
        <SuggestedLinksPanel projectId={id} options={options} />

        {/* Unlinked warning */}
        {unlinkedSourceCount > 0 ? (
          <div
            className="mb-5 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold"
            style={{
              backgroundColor: "var(--devdoc-warning-soft)",
              borderColor: "rgba(202,138,4,0.3)",
              color: "var(--devdoc-warning)",
            }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" clipRule="evenodd" />
            </svg>
            {unlinkedSourceCount} unlinked source{unlinkedSourceCount !== 1 ? "s" : ""}. Linking them improves validation readiness.
          </div>
        ) : null}

        {/* Grid / Builder tabs share the missing-data notices */}
        {(activeTab === "grid" || activeTab === "builder") ? (
          <section className="mb-8">
            {missingSourceMessage ? (
              <div
                className="rounded-xl border border-dashed p-6 text-sm"
                style={{ borderColor: "var(--devdoc-border)", color: "var(--devdoc-muted)" }}
              >
                {missingSourceMessage}
              </div>
            ) : null}
            {missingTargetMessage && !missingSourceMessage ? (
              <div
                className="mt-4 rounded-xl border border-dashed p-6 text-sm"
                style={{ borderColor: "var(--devdoc-border)", color: "var(--devdoc-muted)" }}
              >
                {missingTargetMessage}
              </div>
            ) : null}
            {createError && activeTab === "grid" ? (
              <div
                className="mb-4 rounded-xl border px-4 py-3 text-sm font-semibold"
                style={{
                  borderColor: "color-mix(in srgb, var(--devdoc-error) 35%, var(--devdoc-border))",
                  backgroundColor: "var(--devdoc-error-soft)",
                  color: "var(--devdoc-error)",
                }}
              >
                {createError}
              </div>
            ) : null}
            {canBuildLinks && activeTab === "grid" ? (
              <TraceabilityGrid
                sourceItems={sourceItems}
                targetItems={targetItems}
                links={modeLinks}
                processingTargetId={processingTargetId}
                onToggleCell={handleToggleCell}
              />
            ) : null}
            {canBuildLinks && activeTab === "builder" ? (
              <TraceabilityLinkForm
                sourceItems={sourceItems}
                targetItems={targetItems}
                links={modeLinks}
                mode={activeMode}
                selectedSourceId={selectedSourceId}
                processingTargetId={processingTargetId}
                error={createError}
                onSelectSource={setSelectedSourceId}
                onToggleLink={handleToggleLink}
              />
            ) : null}
          </section>
        ) : null}

        {/* Graph view */}
        {activeTab === "graph" ? (
          <section className="mb-8">
            <TraceabilityGraph projectId={id} options={options} links={links} />
          </section>
        ) : null}

        {/* Audit log */}
        {activeTab === "audit" ? (
        <section>
          <div
            className="mb-4 flex items-end justify-between border-b pb-3"
            style={{ borderColor: "var(--devdoc-border)" }}
          >
            <div>
              <h2 className="font-headline text-lg font-extrabold">Traceability audit log</h2>
              <p className="mt-1 text-sm" style={{ color: "var(--devdoc-muted)" }}>
                All established links across use cases, requirements, and document sections.
              </p>
            </div>
            <span className="text-sm font-semibold" style={{ color: "var(--devdoc-muted)" }}>
              {links.length} total
            </span>
          </div>
          <TraceabilityLinkList
            links={links}
            useCases={useCases}
            requirements={requirements}
            documentSections={documentSections}
            designElements={designElements}
            testCases={testCases}
            isDeletingId={isDeletingId}
            isVerifyingId={isVerifyingId}
            onDelete={handleDelete}
            onVerify={handleVerify}
          />
        </section>
        ) : null}
      </div>
    </main>
  );
}

export default TraceabilityMatrix;
