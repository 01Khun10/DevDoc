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

function TraceabilityMatrix() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { notify } = useNotify();
  const [project, setProject] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [documentSections, setDocumentSections] = useState([]);
  const [links, setLinks] = useState([]);
  const [selectedRequirementId, setSelectedRequirementId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorType, setErrorType] = useState("");
  const [createError, setCreateError] = useState("");
  const [processingSectionId, setProcessingSectionId] = useState("");
  const [isDeletingId, setIsDeletingId] = useState("");

  const linkedRequirementIds = useMemo(
    () => new Set(links.map((link) => link.sourceId)),
    [links]
  );
  const linkedRequirementCount = requirements.filter((requirement) =>
    linkedRequirementIds.has(requirement.id)
  ).length;
  const unlinkedRequirementCount = requirements.length - linkedRequirementCount;

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
      const [loadedProject, options, traceabilityLinks] = await Promise.all([
        getProject(id),
        getTraceabilityOptions(id),
        listTraceabilityLinks(id),
      ]);
      const loadedRequirements = options.requirements || [];

      setProject(loadedProject);
      setRequirements(loadedRequirements);
      setDocumentSections(options.documentSections || []);
      setLinks(traceabilityLinks);
      setSelectedRequirementId((currentId) => {
        if (loadedRequirements.some((requirement) => requirement.id === currentId)) {
          return currentId;
        }

        return "";
      });
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

  async function handleToggleSection(section) {
    if (!selectedRequirementId || processingSectionId) {
      return;
    }

    const existingLink =
      links.find(
        (link) => link.sourceId === selectedRequirementId && link.targetId === section.id
      ) || null;

    setProcessingSectionId(section.id);
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
        sourceType: "REQUIREMENT",
        sourceId: selectedRequirementId,
        targetType: "DOCUMENT_SECTION",
        targetId: section.id,
        linkType: "described_by",
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
      setProcessingSectionId("");
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

  const hasRequirements = requirements.length > 0;
  const hasDocumentSections = documentSections.length > 0;

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
            documents.
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Select a requirement on the left, then click a document section on the right to link
            or unlink it.
          </p>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Total requirements" value={requirements.length} />
          <SummaryCard label="Linked requirements" value={linkedRequirementCount} tone="emerald" />
          <SummaryCard label="Unlinked requirements" value={unlinkedRequirementCount} tone="amber" />
        </section>

        {unlinkedRequirementCount > 0 ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Some requirements are not linked yet. Linking them improves validation readiness.
          </div>
        ) : null}

        <section className="mt-8">
          {!hasRequirements ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600 shadow-sm">
              Create requirements before linking traceability.
            </div>
          ) : null}

          {!hasDocumentSections ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600 shadow-sm">
              Create a document before linking traceability.
            </div>
          ) : null}

          {hasRequirements && hasDocumentSections ? (
            <TraceabilityLinkForm
              requirements={requirements}
              documentSections={documentSections}
              links={links}
              selectedRequirementId={selectedRequirementId}
              processingSectionId={processingSectionId}
              error={createError}
              onSelectRequirement={setSelectedRequirementId}
              onToggleSection={handleToggleSection}
            />
          ) : null}
        </section>

        <section className="mt-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Traceability audit log</h2>
              <p className="mt-1 text-sm text-slate-600">
                Established links between requirements and document sections.
              </p>
            </div>
            <p className="text-sm text-slate-600">{links.length} total</p>
          </div>
          <div className="mt-4">
            <TraceabilityLinkList
              links={links}
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
