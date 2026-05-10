import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
  const valueClasses =
    tone === "amber" ? "text-amber-700" : tone === "emerald" ? "text-emerald-700" : "text-slate-950";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${valueClasses}`}>{value}</p>
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

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-slate-900">
        <p className="text-sm font-medium text-slate-600">Loading traceability...</p>
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
            Could not load traceability. Check your connection and try again.
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

  const missingSourceMessage = sourceItems.length === 0 ? getMissingMessage(activeMode.sourceKind) : "";
  const missingTargetMessage = targetItems.length === 0 ? getMissingMessage(activeMode.targetKind) : "";
  const canBuildLinks = sourceItems.length > 0 && targetItems.length > 0;

  return (
    <main className="min-h-screen bg-[#f8f9fa] px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-7xl">
        <div className="devdoc-card p-8">
          <Link
            className="text-sm font-bold text-indigo-700 hover:text-indigo-800"
            to={`/projects/${id}`}
          >
            Back to project workspace
          </Link>
          <h1 className="font-headline mt-3 text-4xl font-extrabold tracking-tight">
            Traceability Matrix
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Project: <span className="font-semibold text-slate-800">{project.name}</span>
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Traceability links help DevDoc verify that requirements are described in your
            documents and supported by use case scenarios.
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Choose a relationship, select an item on the left, then click an item on the right to
            link or unlink it.
          </p>
        </div>

        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Relationship view
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {MODE_ORDER.map((key) => {
              const mode = TRACEABILITY_MODES[key];
              const isActive = mode.key === activeMode.key;

              return (
                <button
                  key={mode.key}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 transition ${
                    isActive
                      ? "bg-teal-700 text-white ring-teal-700"
                      : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                  }`}
                  type="button"
                  onClick={() => handleModeChange(mode.key)}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-sm text-slate-600">{activeMode.explanation}</p>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <SummaryCard label={`Total ${activeMode.sourceLabel.toLowerCase()}`} value={sourceItems.length} />
          <SummaryCard label="Linked sources" value={linkedSourceCount} tone="emerald" />
          <SummaryCard label="Unlinked sources" value={unlinkedSourceCount} tone="amber" />
        </section>

        {unlinkedSourceCount > 0 ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Some sources are not linked yet. Linking them improves traceability clarity and future
            validation readiness.
          </div>
        ) : null}

        <section className="mt-8">
          {missingSourceMessage ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600 shadow-sm">
              {missingSourceMessage}
            </div>
          ) : null}

          {missingTargetMessage ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600 shadow-sm">
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
              <h2 className="text-lg font-semibold text-slate-950">Traceability audit log</h2>
              <p className="mt-1 text-sm text-slate-600">
                Established links across use cases, requirements, and document sections.
              </p>
            </div>
            <p className="text-sm text-slate-600">{links.length} total</p>
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
