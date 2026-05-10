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
    label: "Use Cases -> Requirements",
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
    label: "Use Cases -> Document Sections",
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
    label: "Requirements -> Document Sections",
    sourceType: "REQUIREMENT",
    targetType: "DOCUMENT_SECTION",
    linkType: "described_by",
    sourceLabel: "Requirements",
    targetLabel: "Document Sections",
    sourceKind: "requirement",
    targetKind: "documentSection",
    explanation: "Link requirements to the document sections that describe them.",
  },
};

const MODE_ORDER = [
  "USE_CASE_REQUIREMENT",
  "USE_CASE_DOCUMENT_SECTION",
  "REQUIREMENT_DOCUMENT_SECTION",
];

function SummaryCard({ label, value, tone = "slate" }) {
  const valueColor =
    tone === "amber" ? "var(--devdoc-warning)" :
    tone === "emerald" ? "var(--devdoc-success)" :
    "var(--devdoc-text)";

  return (
    <div className="devdoc-card-border p-4">
      <p className="devdoc-label">{label}</p>
      <p className="mt-2 text-2xl font-bold" style={{ color: valueColor }}>{value}</p>
    </div>
  );
}

function getDefaultModeKey(useCases) {
  return useCases.length > 0 ? "USE_CASE_REQUIREMENT" : "REQUIREMENT_DOCUMENT_SECTION";
}

function getItemsByKind(kind, options) {
  if (kind === "useCase") {
    return options.useCases;
  }

  if (kind === "requirement") {
    return options.requirements;
  }

  return options.documentSections;
}

function getMissingMessage(kind) {
  if (kind === "useCase") {
    return "Create use cases before linking this traceability view.";
  }

  if (kind === "requirement") {
    return "Create requirements before linking this traceability view.";
  }

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
    () => ({ useCases, requirements, documentSections }),
    [documentSections, requirements, useCases]
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
      setLinks(traceabilityLinks);
      setModeKey((currentMode) => currentMode || getDefaultModeKey(loadedUseCases));
      setSelectedSourceId("");
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

  function handleModeChange(nextModeKey) {
    setModeKey(nextModeKey);
    setSelectedSourceId("");
    setCreateError("");
  }

  async function handleDelete(linkId, options = {}) {
    if (!options.skipConfirm && !window.confirm("Remove this traceability link?")) {
      return false;
    }

    setIsDeletingId(linkId);
    setCreateError("");

    try {
      await deleteTraceabilityLink(id, linkId);
      setLinks((currentLinks) => currentLinks.filter((link) => link.id !== linkId));
      notify("Traceability link removed.", { tone: "success" });
      return true;
    } catch (error) {
      if (handleRequestError(error)) {
        return false;
      }

      setCreateError(error.message || "Could not remove traceability link.");
      return false;
    } finally {
      setIsDeletingId("");
    }
  }

  async function handleToggleLink(target) {
    if (!selectedSourceId || processingTargetId) {
      return;
    }

    const existingLink =
      modeLinks.find(
        (link) => link.sourceId === selectedSourceId && link.targetId === target.id
      ) || null;

    setProcessingTargetId(target.id);
    setCreateError("");

    try {
      if (existingLink) {
        if (!window.confirm("Remove this traceability link?")) {
          return;
        }

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
      if (handleRequestError(error)) {
        return;
      }

      setCreateError(error.message || "Could not update traceability link.");
    } finally {
      setProcessingTargetId("");
    }
  }

  if (isLoading) return <LoadingSpinner fullScreen label="Loading traceability..." />;

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
          <p className="font-headline text-xl font-extrabold text-[var(--devdoc-text)]">Could not load traceability</p>
          <p className="mt-2 text-sm text-[var(--devdoc-muted)]">Check your connection and try again.</p>
          <button className="devdoc-gradient-button mt-6" onClick={loadPage}>Retry</button>
        </div>
      </main>
    );
  }

  const missingSourceMessage = sourceItems.length === 0 ? getMissingMessage(activeMode.sourceKind) : "";
  const missingTargetMessage = targetItems.length === 0 ? getMissingMessage(activeMode.targetKind) : "";
  const canBuildLinks = sourceItems.length > 0 && targetItems.length > 0;

  return (
    <main className="min-h-screen bg-[var(--devdoc-bg)] px-6 py-8 text-[var(--devdoc-text)]">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="devdoc-label text-[var(--devdoc-primary)]">{project.name}</p>
          <h1 className="font-headline mt-2 text-4xl font-extrabold tracking-tight">Traceability Matrix</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--devdoc-muted)]">
            Choose a relationship, select an item on the left, then click an item on the right to link or unlink it. Traceability links help verify coverage across use cases, requirements, and documentation.
          </p>
        </div>

        <section
          className="devdoc-card-border mt-8 p-5"
          style={{ backgroundColor: "var(--devdoc-surface)", borderColor: "var(--devdoc-border)" }}
        >
          <p className="devdoc-label">Relationship view</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {MODE_ORDER.map((key) => {
              const mode = TRACEABILITY_MODES[key];
              const isActive = mode.key === activeMode.key;

              return (
                <button
                  key={mode.key}
                  className="rounded-full px-4 py-2 text-sm font-bold transition"
                  style={{
                    backgroundColor: isActive ? "var(--devdoc-primary)" : "var(--devdoc-surface-muted)",
                    color: isActive ? "#ffffff" : "var(--devdoc-text)",
                    border: `1px solid ${isActive ? "var(--devdoc-primary)" : "var(--devdoc-border)"}`,
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
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <SummaryCard label={`Total ${activeMode.sourceLabel.toLowerCase()}`} value={sourceItems.length} />
          <SummaryCard label="Linked sources" value={linkedSourceCount} tone="emerald" />
          <SummaryCard label="Unlinked sources" value={unlinkedSourceCount} tone="amber" />
        </section>

        {unlinkedSourceCount > 0 ? (
          <div
            className="mt-4 rounded-xl border px-4 py-3 text-sm font-semibold"
            style={{
              backgroundColor: "rgba(245,158,11,0.1)",
              borderColor: "rgba(245,158,11,0.35)",
              color: "var(--devdoc-warning)"
            }}
          >
            Some sources are not linked yet. Linking them improves traceability clarity and future
            validation readiness.
          </div>
        ) : null}

        <section className="mt-8">
          {missingSourceMessage ? (
            <div
              className="rounded-xl border border-dashed p-6 text-sm"
              style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)", color: "var(--devdoc-muted)" }}
            >
              {missingSourceMessage}
            </div>
          ) : null}

          {missingTargetMessage ? (
            <div
              className="mt-4 rounded-xl border border-dashed p-6 text-sm"
              style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)", color: "var(--devdoc-muted)" }}
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

        <section className="mt-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold" style={{ color: "var(--devdoc-text)" }}>Traceability audit log</h2>
              <p className="mt-1 text-sm" style={{ color: "var(--devdoc-muted)" }}>
                Established links across use cases, requirements, and document sections.
              </p>
            </div>
            <p className="text-sm" style={{ color: "var(--devdoc-muted)" }}>{links.length} total</p>
          </div>
          <div className="mt-4">
            <TraceabilityLinkList
              links={links}
              useCases={useCases}
              requirements={requirements}
              documentSections={documentSections}
              isDeletingId={isDeletingId}
              onDelete={handleDelete}
            />
          </div>
        </section>
      </section>
    </main>
  );
}

export default TraceabilityMatrix;
