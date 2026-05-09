import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import TraceabilityLinkForm from "../components/TraceabilityLinkForm";
import TraceabilityLinkList from "../components/TraceabilityLinkList";
import useAuth from "../hooks/useAuth";
import { getProject } from "../services/projectService";
import {
  createTraceabilityLink,
  deleteTraceabilityLink,
  getTraceabilityOptions,
  listTraceabilityLinks
} from "../services/traceabilityService";

function TraceabilityMatrix() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [project, setProject] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [documentSections, setDocumentSections] = useState([]);
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorType, setErrorType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");
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
    setCreateError("");

    try {
      const [loadedProject, options, traceabilityLinks] = await Promise.all([
        getProject(id),
        getTraceabilityOptions(id),
        listTraceabilityLinks(id)
      ]);
      setProject(loadedProject);
      setRequirements(options.requirements || []);
      setDocumentSections(options.documentSections || []);
      setLinks(traceabilityLinks);
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

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  async function refreshLinks() {
    const traceabilityLinks = await listTraceabilityLinks(id);
    setLinks(traceabilityLinks);
  }

  async function handleCreate(input) {
    setIsSubmitting(true);
    setCreateError("");

    try {
      await createTraceabilityLink(id, input);
      await refreshLinks();
    } catch (error) {
      if (handleRequestError(error)) {
        return;
      }

      setCreateError(error.message || "Could not create traceability link.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(linkId) {
    setIsDeletingId(linkId);
    setCreateError("");

    try {
      await deleteTraceabilityLink(id, linkId);
      setLinks((currentLinks) => currentLinks.filter((link) => link.id !== linkId));
    } catch (error) {
      if (handleRequestError(error)) {
        return;
      }

      setCreateError(error.message || "Could not remove traceability link.");
    } finally {
      setIsDeletingId("");
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
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              className="text-sm font-semibold text-teal-700 hover:text-teal-800"
              to={`/projects/${id}`}
            >
              Back to project workspace
            </Link>
            <h1 className="mt-3 text-3xl font-bold">Traceability Matrix</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Project: <span className="font-semibold text-slate-800">{project.name}</span>
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Link requirements to the document sections that describe or support them.
            </p>
          </div>
          <button
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
            type="button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">Requirements</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{requirements.length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">Document Sections</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{documentSections.length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">Links</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{links.length}</p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-950">Create traceability link</h2>
          <div className="mt-4">
            {!hasRequirements ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600 shadow-sm">
                Create requirements before linking traceability.
              </div>
            ) : null}

            {!hasDocumentSections ? (
              <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600 shadow-sm">
                Create a document before linking traceability.
              </div>
            ) : null}

            {hasRequirements && hasDocumentSections ? (
              <TraceabilityLinkForm
                requirements={requirements}
                documentSections={documentSections}
                isSubmitting={isSubmitting}
                error={createError}
                onCreate={handleCreate}
              />
            ) : null}
          </div>
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-950">Existing links</h2>
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
