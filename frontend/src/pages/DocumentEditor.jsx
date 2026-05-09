import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DocumentEditorPanel from "../components/DocumentEditorPanel";
import DocumentGuidancePanel from "../components/DocumentGuidancePanel";
import useAuth from "../hooks/useAuth";
import { getDocument, updateDocumentSection } from "../services/documentService";

function Badge({ children, tone = "slate" }) {
  const classes =
    tone === "teal"
      ? "bg-teal-50 text-teal-700 ring-teal-100"
      : tone === "emerald"
        ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
        : tone === "amber"
          ? "bg-amber-50 text-amber-700 ring-amber-100"
          : "bg-slate-100 text-slate-700 ring-slate-200";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${classes}`}>
      {children}
    </span>
  );
}

function getSaveErrorMessage(error) {
  if (error.fields) {
    return Object.values(error.fields)[0] || error.message || "Could not save section.";
  }

  return error.message || "Could not save section.";
}

function RibbonButton({ children, wide = false }) {
  return (
    <button
      className={`rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-400 ${
        wide ? "min-w-20" : "min-w-8"
      }`}
      disabled
      title="Formatting tools will be added later."
      type="button"
    >
      {children}
    </button>
  );
}

function DocumentEditor() {
  const { projectId, documentId } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [document, setDocument] = useState(null);
  const [sections, setSections] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const selectedSection = useMemo(
    () => sections.find((section) => section.id === selectedSectionId) || null,
    [sections, selectedSectionId]
  );

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

  useEffect(() => {
    let isCancelled = false;

    async function loadDocument() {
      setIsLoading(true);
      setLoadError("");
      setSaveError("");
      setSaveSuccess("");

      try {
        const loadedDocument = await getDocument(projectId, documentId);
        const loadedSections = loadedDocument.sections || [];
        const firstSection = loadedSections[0] || null;

        if (!isCancelled) {
          setDocument(loadedDocument);
          setSections(loadedSections);
          setSelectedSectionId(firstSection?.id || "");
          setEditorContent(firstSection?.content || "");
          setHasUnsavedChanges(false);
        }
      } catch (error) {
        if (handleRequestError(error)) {
          return;
        }

        if (!isCancelled) {
          setLoadError(error.status === 404 ? "not-found" : "general");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadDocument();

    return () => {
      isCancelled = true;
    };
  }, [documentId, handleRequestError, projectId]);

  function handleSelectSection(section) {
    if (section.id === selectedSectionId) {
      return;
    }

    if (hasUnsavedChanges && !window.confirm("You have unsaved changes. Discard them?")) {
      return;
    }

    setSelectedSectionId(section.id);
    setEditorContent(section.content || "");
    setHasUnsavedChanges(false);
    setSaveError("");
    setSaveSuccess("");
  }

  function handleChangeContent(value) {
    setEditorContent(value);
    setHasUnsavedChanges(true);
    setSaveError("");
    setSaveSuccess("");
  }

  async function handleSaveSection() {
    if (!selectedSection) {
      return;
    }

    setIsSaving(true);
    setSaveError("");
    setSaveSuccess("");

    try {
      const result = await updateDocumentSection(
        projectId,
        documentId,
        selectedSection.id,
        editorContent
      );

      setSections((currentSections) =>
        currentSections.map((section) =>
          section.id === result.section.id ? { ...section, ...result.section } : section
        )
      );
      setDocument((currentDocument) =>
        currentDocument ? { ...currentDocument, ...result.document } : currentDocument
      );
      setEditorContent(result.section.content || "");
      setHasUnsavedChanges(false);
      setSaveSuccess("Section saved.");
    } catch (error) {
      if (handleRequestError(error)) {
        return;
      }

      setSaveError(
        error.status === 404 ? "Document or section not found." : getSaveErrorMessage(error)
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-slate-900">
        <p className="text-sm font-medium text-slate-600">Loading document...</p>
      </main>
    );
  }

  if (loadError === "not-found") {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
        <section className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-lg font-semibold text-slate-950">Document not found.</p>
          <Link
            className="mt-5 inline-flex text-sm font-semibold text-teal-700 hover:text-teal-800"
            to={`/projects/${projectId}`}
          >
            Back to project workspace
          </Link>
        </section>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
        <section className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-lg font-semibold text-slate-950">
            Could not load document. Check your connection and try again.
          </p>
          <Link
            className="mt-5 inline-flex text-sm font-semibold text-teal-700 hover:text-teal-800"
            to={`/projects/${projectId}`}
          >
            Back to project workspace
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-200 text-slate-950">
      <header className="border-b border-slate-300 bg-white shadow-sm">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-3 sm:px-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800"
              to={`/projects/${projectId}`}
            >
              <span aria-hidden="true">&lt;-</span>
              Back to project
            </Link>
            <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:items-center">
              <p className="text-base font-extrabold tracking-wide text-slate-900">DevDoc</p>
              <span className="hidden h-4 w-px bg-slate-300 lg:block" />
              <h1 className="truncate text-2xl font-bold text-slate-950">{document.title}</h1>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center xl:justify-end">
            <div className="flex flex-wrap gap-2">
              <Badge tone="teal">{document.documentType}</Badge>
              <Badge
                tone={
                  document.status === "COMPLETE"
                    ? "emerald"
                    : document.status === "IN_PROGRESS"
                      ? "amber"
                      : "slate"
                }
              >
                {document.status}
              </Badge>
              <Badge>{document.completionPercent}% complete</Badge>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                hasUnsavedChanges
                  ? "bg-amber-50 text-amber-700 ring-amber-100"
                  : "bg-emerald-50 text-emerald-700 ring-emerald-100"
              }`}
            >
              Save status: {hasUnsavedChanges ? "Unsaved changes" : "Saved"}
            </span>
            <button
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>

        <div className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-1 px-4 py-2 sm:px-6">
            {["File", "Home", "Insert", "Review", "View"].map((tab) => (
              <button
                key={tab}
                className={`rounded px-3 py-1.5 text-sm font-semibold ${
                  tab === "Home"
                    ? "bg-white text-teal-700 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-600 hover:bg-white"
                }`}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <span className="text-xs font-semibold uppercase text-slate-500">Font</span>
              <RibbonButton wide>Aptos</RibbonButton>
              <RibbonButton>11</RibbonButton>
            </div>
            <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <RibbonButton>B</RibbonButton>
              <RibbonButton>I</RibbonButton>
              <RibbonButton>U</RibbonButton>
            </div>
            <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <RibbonButton wide>Bullets</RibbonButton>
              <RibbonButton wide>List</RibbonButton>
              <RibbonButton wide>Left</RibbonButton>
              <RibbonButton wide>Center</RibbonButton>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <RibbonButton wide>Review</RibbonButton>
              <span className="text-xs text-slate-500">Visual tools only</span>
            </div>
            {document.template?.name ? (
              <p className="text-sm text-slate-600">
                Template: <span className="font-semibold text-slate-800">{document.template.name}</span>
              </p>
            ) : null}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
        <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <DocumentGuidancePanel
            document={document}
            section={selectedSection}
            sections={sections}
            selectedSectionId={selectedSectionId}
            onSelectSection={handleSelectSection}
          />
          <DocumentEditorPanel
            section={selectedSection}
            editorContent={editorContent}
            hasUnsavedChanges={hasUnsavedChanges}
            isSaving={isSaving}
            saveError={saveError}
            saveSuccess={saveSuccess}
            onChangeContent={handleChangeContent}
            onSave={handleSaveSection}
          />
        </div>
      </section>
    </main>
  );
}

export default DocumentEditor;
