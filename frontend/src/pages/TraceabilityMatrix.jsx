import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import TraceabilityLinkForm from "../components/TraceabilityLinkForm";
import TraceabilityLinkList from "../components/TraceabilityLinkList";
import { useNotify } from "../context/NotificationContext";
import useAuth from "../hooks/useAuth";
import { getProject } from "../services/projectService";
import {
  createTraceabilityLink,
  deleteTraceabilityLink,
  getTraceabilityOptions,
  listTraceabilityLinks,
} from "../services/traceabilityService";

const TRACEABILITY_MODES = {
  USE_CASE_REQUIREMENT: {
    key: "USE_CASE_REQUIREMENT",
    label: "Use Cases → Requirements",
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
    label: "Use Cases → Sections",
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
    label: "Requirements → Sections",
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
    label: "Requirements → Design Elements",
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
    label: "Requirements → Test Cases",
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
  if (kind === "useCase") return options.useCases;
  if (kind === "requirement") return options.requirements;
  if (kind === "designElement") return options.designElements;
  if (kind === "testCase") return options.testCases;
  return options.documentSections;
}

function getMissingMessage(kind) {
  if (kind === "useCase") return "Create use cases before linking this traceability view.";
  if (kind === "requirement") return "Create requirements before linking this traceability view.";
  if (kind === "designElement") return "Create design elements before linking this traceability view.";
  if (kind === "testCase") return "Create test cases before linking this traceability view.";
  return "Create a document before linking this traceability view.";
}

function TraceabilityMatrix() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { notify } = useNotify();
  const [project, setProject] = useState(null);
  const [useCases, setUseCases] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [documentSections, setDocumentSections] = useState([]);
  const [designElements, setDesignElements] = useState([]);
  const [testCases, setTestCases] = useState([]);
  const [links, setLinks] = useState([]);
  const [modeKey, setModeKey] = useState("");
  const [selectedSourceId, setSelectedSourceId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorType, setErrorType] = useState("");
  const [createError, setCreateError] = useState("");
  const [processingTargetId, setProcessingTargetId] = useState("");
  const [isDeletingId, setIsDeletingId] = useState("");

  const activeMode = TRACEABILITY_MODES[modeKey] || TRACEABILITY_MODES.REQUIREMENT_DOCUMENT_SECTION;
  const options = useMemo(
    () => ({ useCases, requirements, documentSections, designElements, testCases }),
    [designElements, documentSections, requirements, testCases, useCases]
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
    setCreateError("");
    try {
      const [loadedProject, loadedOptions, traceabilityLinks] = await Promise.all([
        getProject(id),
        getTraceabilityOptions(id),
        listTraceabilityLinks(id),
      ]);
      const loadedUseCases = loadedOptions.useCases || [];
      const loadedRequirements = loadedOptions.requirements || [];
      const loadedDocumentSections = loadedOptions.documentSections || [];
      setProject(loadedProject);
      setUseCases(loadedUseCases);
      setRequirements(loadedRequirements);
      setDocumentSections(loadedDocumentSections);
      setDesignElements(loadedOptions.designElements || []);
      setTestCases(loadedOptions.testCases || []);
      setLinks(traceabilityLinks);
      setModeKey((currentMode) => currentMode || getDefaultModeKey(loadedUseCases));
      setSelectedSourceId("");
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
      await deleteTraceabilityLink(id, linkId);
      setLinks((currentLinks) => currentLinks.filter((link) => link.id !== linkId));
      notify("Traceability link removed.", { tone: "success" });
      return true;
    } catch (error) {
      if (handleRequestError(error)) return false;
      setCreateError(error.message || "Could not remove traceability link.");
      return false;
    } finally {
      setIsDeletingId("");
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
        await deleteTraceabilityLink(id, existingLink.id);
        setLinks((currentLinks) => currentLinks.filter((link) => link.id !== existingLink.id));
        notify("Traceability link removed.", { tone: "success" });
        return;
      }
      const createdLink = await createTraceabilityLink(id, {
        sourceType: activeMode.sourceType,
        sourceId: selectedSourceId,
        targetType: activeMode.targetType,
        targetId: target.id,
        linkType: activeMode.linkType,
      });
      setLinks((currentLinks) => {
        const alreadyExists = currentLinks.some((link) => link.id === createdLink.id);
        return alreadyExists ? currentLinks : [createdLink, ...currentLinks];
      });
      notify("Traceability link added.", { tone: "success" });
    } catch (error) {
      if (handleRequestError(error)) return;
      setCreateError(error.message || "Could not update traceability link.");
    } finally {
      setProcessingTargetId("");
    }
  }

  if (isLoading) return <LoadingSpinner fullScreen label="Loading traceability..." />;

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
          <button className="devdoc-gradient-button mt-6" onClick={loadPage}>Retry</button>
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

        {/* Link builder */}
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
          {canBuildLinks ? (
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

        {/* Audit log */}
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
            onDelete={handleDelete}
          />
        </section>
      </div>
    </main>
  );
}

export default TraceabilityMatrix;
