import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DocumentEditorPanel from "../components/DocumentEditorPanel";
import DocumentGuidancePanel from "../components/DocumentGuidancePanel";
import DocumentSectionSidebar from "../components/DocumentSectionSidebar";
import { useNotify } from "../context/NotificationContext";
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
  const params = useParams();
  const projectId = params.id || params.projectId;
  const documentId = params.documentId;
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { notify } = useNotify();
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

  const selectedSectionIndex = useMemo(
    () => sections.findIndex((section) => section.id === selectedSectionId),
    [sections, selectedSectionId]
  );

  const completedSectionCount = useMemo(
    () => sections.filter((section) => section.status === "COMPLETE").length,
    [sections]
  );

  function getPreviousSection() {
    if (selectedSectionIndex <= 0) {
      return null;
    }

    return sections[selectedSectionIndex - 1] || null;
  }

  function getNextSection() {
    if (selectedSectionIndex < 0 || selectedSectionIndex >= sections.length - 1) {
      return null;
    }

    return sections[selectedSectionIndex + 1] || null;
  }

  const canGoPrevious = selectedSectionIndex > 0;
  const canGoNext = selectedSectionIndex >= 0 && selectedSectionIndex < sections.length - 1;

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

  function switchToSection(section, options = {}) {
    if (!section || section.id === selectedSectionId) {
      return false;
    }

    if (
      !options.skipConfirm &&
      hasUnsavedChanges &&
      !window.confirm("You have unsaved changes. Discard them?")
    ) {
      return false;
    }

    setSelectedSectionId(section.id);
    setEditorContent(section.content || "");
    setHasUnsavedChanges(false);
    setSaveError("");
    setSaveSuccess("");
    return true;
  }

  function handleSelectSection(section) {
    switchToSection(section);
  }

  function handlePreviousSection() {
    switchToSection(getPreviousSection());
  }

  function handleNextSection() {
    switchToSection(getNextSection());
  }

  function handleChangeContent(value) {
    setEditorContent(value);
    setHasUnsavedChanges(true);
    setSaveError("");
    setSaveSuccess("");
  }

  async function saveCurrentSection(successMessage = "Section saved.") {
    if (!selectedSection) {
      return false;
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
      setSaveSuccess(successMessage);
      notify("Section saved.", { tone: "success" });
      return true;
    } catch (error) {
      if (handleRequestError(error)) {
        return false;
      }

      setSaveError(
        error.status === 404 ? "Document or section not found." : getSaveErrorMessage(error)
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveSection() {
    await saveCurrentSection();
  }

  async function handleSaveAndNext() {
    const nextSection = getNextSection();
    const didSave = await saveCurrentSection(
      nextSection ? "Section saved. Moved to next section." : "Section saved."
    );

    if (didSave && nextSection) {
      setSelectedSectionId(nextSection.id);
      setEditorContent(nextSection.content || "");
      setHasUnsavedChanges(false);
      setSaveError("");
    }
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
        <div className="mx-auto flex max-w-[1800px] flex-col gap-4 px-4 py-3 sm:px-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
              DevDoc document workspace
            </p>
            <h1 className="mt-1 truncate text-2xl font-bold text-slate-950">{document.title}</h1>
            {document.template?.name ? (
              <p className="mt-1 text-sm text-slate-600">
                Template: <span className="font-semibold text-slate-800">{document.template.name}</span>
              </p>
            ) : null}
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
          </div>
        </div>

        <div className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto flex max-w-[1800px] flex-wrap items-center gap-1 px-4 py-2 sm:px-6">
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
          <div className="mx-auto flex max-w-[1800px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
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
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6">
        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_340px]">
          <DocumentSectionSidebar
            sections={sections}
            selectedSectionId={selectedSectionId}
            onSelectSection={handleSelectSection}
            completionPercent={document.completionPercent}
            completedCount={completedSectionCount}
          />
          <DocumentEditorPanel
            section={selectedSection}
            editorContent={editorContent}
            hasUnsavedChanges={hasUnsavedChanges}
            isSaving={isSaving}
            saveError={saveError}
            saveSuccess={saveSuccess}
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
            onChangeContent={handleChangeContent}
            onSave={handleSaveSection}
            onSaveAndNext={handleSaveAndNext}
            onPrevious={handlePreviousSection}
            onNext={handleNextSection}
          />
          <DocumentGuidancePanel section={selectedSection} />
        </div>
      </section>
    </main>
  );
}

export default DocumentEditor;
