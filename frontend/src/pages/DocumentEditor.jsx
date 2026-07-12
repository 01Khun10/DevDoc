import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import DocumentEditorPanel from "../components/DocumentEditorPanel";
import DocumentGuidancePanel from "../components/DocumentGuidancePanel";
import DocumentSectionSidebar from "../components/DocumentSectionSidebar";
import { useNotify } from "../context/NotificationContext";
import {
  useDocument,
  useSectionLinkedArtefacts,
  useUpdateDocumentSection
} from "../api/documents";
import useAuthGuard from "../api/useAuthGuard";
import { useProjectOverview } from "../api/projects";

function Badge({ children, tone = "slate" }) {
  const colorMap = {
    teal:    { bg: "rgba(20,184,166,0.12)",  border: "rgba(20,184,166,0.35)",  color: "#0d9488" },
    emerald: { bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.35)",  color: "#059669" },
    amber:   { bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.35)",  color: "#b45309" },
    slate:   { bg: "var(--devdoc-surface-muted)", border: "var(--devdoc-border)", color: "var(--devdoc-muted)" },
  };
  const s = colorMap[tone] || colorMap.slate;
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-xs font-bold"
      style={{ backgroundColor: s.bg, border: `1px solid ${s.border}`, color: s.color }}
    >
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
      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition opacity-50 cursor-not-allowed ${wide ? "min-w-20" : "min-w-8"}`}
      style={{
        border: "1px solid var(--devdoc-border)",
        backgroundColor: "var(--devdoc-surface)",
        color: "var(--devdoc-muted)",
      }}
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
  const { notify } = useNotify();
  const [searchParams] = useSearchParams();
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const editorContentRef = useRef("");

  const [activeRibbonTab, setActiveRibbonTab] = useState("Home");
  const [editorFontFamily, setEditorFontFamily] = useState("Inter");
  const [editorFontSize, setEditorFontSize] = useState("16");
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showSectionRail, setShowSectionRail] = useState(true);
  const [showGuidancePanel, setShowGuidancePanel] = useState(true);
  const [writingIssues, setWritingIssues] = useState(null);

  const documentQuery = useDocument(projectId, documentId);
  const overviewQuery = useProjectOverview(projectId);
  const linkedArtefactsQuery = useSectionLinkedArtefacts(projectId, documentId, selectedSectionId);
  const saveMutation = useUpdateDocumentSection(projectId, documentId);
  useAuthGuard(documentQuery.error, linkedArtefactsQuery.error, saveMutation.error);

  const document = documentQuery.data || null;
  const sections = useMemo(() => document?.sections || [], [document]);
  const isLoading = documentQuery.isLoading;
  const loadError = documentQuery.error
    ? (documentQuery.error.status === 404 ? "not-found" : "general")
    : "";
  const isSaving = saveMutation.isPending;
  // Export gate: latest validation run completed with zero ERROR findings.
  const latestValidation = overviewQuery.data?.latestValidation || null;
  const canExport = Boolean(
    latestValidation && latestValidation.status === "COMPLETED" && latestValidation.errorCount === 0
  );
  const linkedArtefacts = linkedArtefactsQuery.data || null;
  const isLoadingLinkedArtefacts = linkedArtefactsQuery.isLoading && Boolean(selectedSectionId);
  const linkedArtefactsError = linkedArtefactsQuery.error ? "Could not load linked artefacts." : "";

  // Select the initial section once the document arrives; a ?highlight=
  // query param (validation deep link) wins over the first section.
  useEffect(() => {
    if (document && !selectedSectionId) {
      const highlightId = searchParams.get("highlight");
      const initialSection =
        document.sections?.find((section) => section.id === highlightId) ||
        document.sections?.[0] ||
        null;
      setSelectedSectionId(initialSection?.id || "");
      setEditorContent(initialSection?.content || "");
      editorContentRef.current = initialSection?.content || "";
      setHasUnsavedChanges(false);
    }
  }, [document, selectedSectionId, searchParams]);

  const getGridClasses = () => {
    if (isFocusMode) return "xl:grid-cols-1 max-w-5xl mx-auto";
    if (showSectionRail && showGuidancePanel) return "xl:grid-cols-[320px_minmax(0,1fr)_340px]";
    if (showSectionRail) return "xl:grid-cols-[320px_minmax(0,1fr)]";
    if (showGuidancePanel) return "xl:grid-cols-[minmax(0,1fr)_340px]";
    return "xl:grid-cols-[minmax(0,1fr)]";
  };

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
    editorContentRef.current = section.content || "";
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
    editorContentRef.current = value;
    setHasUnsavedChanges(true);
    setSaveError("");
    setSaveSuccess("");
  }

  async function saveCurrentSection(successMessage = "Section saved.", options = {}) {
    if (!selectedSection) {
      return false;
    }

    setSaveError("");
    if (!options.silent) {
      setSaveSuccess("");
    }

    // The TipTap editor owns the document after mount, so do not write the
    // saved content back into state; just record what was persisted.
    const contentToSave = editorContent;

    try {
      await saveMutation.mutateAsync({
        sectionId: selectedSection.id,
        content: contentToSave
      });

      // Only clear the dirty flag if nothing was typed while saving.
      if (editorContentRef.current === contentToSave) {
        setHasUnsavedChanges(false);
      }
      setLastSavedAt(new Date());

      if (!options.silent) {
        setSaveSuccess(successMessage);
        notify("Section saved.", { tone: "success" });
      }
      return true;
    } catch (error) {
      setSaveError(
        error.status === 404 ? "Document or section not found." : getSaveErrorMessage(error)
      );
      return false;
    }
  }

  // Debounced autosave: persist quietly after 3s of idle typing.
  useEffect(() => {
    if (!hasUnsavedChanges || isSaving || !selectedSection) {
      return undefined;
    }

    const timer = setTimeout(() => {
      saveCurrentSection("", { silent: true });
    }, 3000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorContent, hasUnsavedChanges, isSaving, selectedSection]);

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
      editorContentRef.current = nextSection.content || "";
      setHasUnsavedChanges(false);
      setSaveError("");
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6" style={{ backgroundColor: "var(--devdoc-bg)", color: "var(--devdoc-text)" }}>
        <p className="text-sm font-medium" style={{ color: "var(--devdoc-muted)" }}>Loading document...</p>
      </main>
    );
  }

  if (loadError === "not-found") {
    return (
      <main className="min-h-screen px-6 py-10" style={{ backgroundColor: "var(--devdoc-bg)" }}>
        <section className="mx-auto max-w-3xl devdoc-card-border p-8">
          <p className="text-lg font-semibold" style={{ color: "var(--devdoc-text)" }}>Document not found.</p>
          <Link
            className="mt-5 inline-flex text-sm font-semibold"
            style={{ color: "var(--devdoc-primary)" }}
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
      <main className="min-h-screen px-6 py-10" style={{ backgroundColor: "var(--devdoc-bg)" }}>
        <section className="mx-auto max-w-3xl devdoc-card-border p-8">
          <p className="text-lg font-semibold" style={{ color: "var(--devdoc-text)" }}>
            Could not load document. Check your connection and try again.
          </p>
          <Link
            className="mt-5 inline-flex text-sm font-semibold"
            style={{ color: "var(--devdoc-primary)" }}
            to={`/projects/${projectId}`}
          >
            Back to project workspace
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--devdoc-bg)", color: "var(--devdoc-text)" }}>
      <header
        className="border-b shadow-sm"
        style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
      >
        <div className="mx-auto flex max-w-[1800px] flex-col gap-4 px-4 py-3 sm:px-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <p className="devdoc-label">DevDoc document workspace</p>
            <h1 className="mt-1 truncate text-2xl font-bold" style={{ color: "var(--devdoc-text)" }}>{document.title}</h1>
            {document.template?.name ? (
              <p className="mt-1 text-sm" style={{ color: "var(--devdoc-muted)" }}>
                Template: <span className="font-semibold" style={{ color: "var(--devdoc-text)" }}>{document.template.name}</span>
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
              className="rounded-full px-2.5 py-0.5 text-xs font-bold"
              style={{
                backgroundColor: hasUnsavedChanges ? "rgba(245,158,11,0.12)" : "rgba(16,185,129,0.12)",
                border: `1px solid ${hasUnsavedChanges ? "rgba(245,158,11,0.35)" : "rgba(16,185,129,0.35)"}`,
                color: hasUnsavedChanges ? "var(--devdoc-warning)" : "var(--devdoc-success)",
              }}
            >
              {hasUnsavedChanges
                ? "Unsaved changes"
                : lastSavedAt
                  ? `Saved - ${lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                  : "Saved"}
            </span>
            {canExport ? (
              <Link
                className="rounded-lg border px-3 py-1.5 text-xs font-bold transition"
                style={{
                  borderColor: "var(--devdoc-border)",
                  backgroundColor: "var(--devdoc-surface)",
                  color: "var(--devdoc-primary)",
                }}
                to={`/projects/${projectId}/documents/${documentId}/print`}
              >
                Export / Print
              </Link>
            ) : (
              <span
                className="rounded-lg border px-3 py-1.5 text-xs font-bold opacity-50"
                style={{
                  borderColor: "var(--devdoc-border)",
                  backgroundColor: "var(--devdoc-surface)",
                  color: "var(--devdoc-muted)",
                }}
                title="Export unlocks when the latest validation run has zero errors."
              >
                Export / Print
              </span>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6">
        <div className={`grid gap-6 ${getGridClasses()}`}>
          {showSectionRail && !isFocusMode && (
            <DocumentSectionSidebar
              sections={sections}
              selectedSectionId={selectedSectionId}
              onSelectSection={handleSelectSection}
              completionPercent={document.completionPercent}
              completedCount={completedSectionCount}
            />
          )}
          <DocumentEditorPanel
            section={selectedSection}
            editorContent={editorContent}
            hasUnsavedChanges={hasUnsavedChanges}
            isSaving={isSaving}
            saveError={saveError}
            saveSuccess={saveSuccess}
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
            activeRibbonTab={activeRibbonTab}
            setActiveRibbonTab={setActiveRibbonTab}
            editorFontFamily={editorFontFamily}
            setEditorFontFamily={setEditorFontFamily}
            editorFontSize={editorFontSize}
            setEditorFontSize={setEditorFontSize}
            isFocusMode={isFocusMode}
            setIsFocusMode={setIsFocusMode}
            showSectionRail={showSectionRail}
            setShowSectionRail={setShowSectionRail}
            showGuidancePanel={showGuidancePanel}
            setShowGuidancePanel={setShowGuidancePanel}
            setWritingIssues={setWritingIssues}
            projectId={projectId}
            onChangeContent={handleChangeContent}
            onSave={handleSaveSection}
            onSaveAndNext={handleSaveAndNext}
            onPrevious={handlePreviousSection}
            onNext={handleNextSection}
          />
          {showGuidancePanel && !isFocusMode && (
            <DocumentGuidancePanel 
              section={selectedSection} 
              writingIssues={writingIssues}
              linkedArtefacts={linkedArtefacts}
              isLoadingLinkedArtefacts={isLoadingLinkedArtefacts}
              linkedArtefactsError={linkedArtefactsError}
            />
          )}
        </div>
      </section>
    </main>
  );
}

export default DocumentEditor;
