import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import DocumentEditorPanel from "../components/DocumentEditorPanel";
import DocumentGuidancePanel from "../components/DocumentGuidancePanel";
import DocumentSectionSidebar from "../components/DocumentSectionSidebar";
import { useNotify } from "../context/NotificationContext";
import { useDocument, useSectionLinkedArtefacts, useUpdateDocumentSection } from "../api/documents";
import useAuthGuard from "../api/useAuthGuard";
import useUnsavedChangesWarning from "../hooks/useUnsavedChangesWarning";
import { useProjectOverview } from "../api/projects";

function Icon({ children, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
  );
}

const TYPE_COLOR = {
  SCOPE: "var(--devdoc-artifact-uc)", SRS: "var(--devdoc-artifact-fr)",
  SDS: "var(--devdoc-artifact-de)", STP: "var(--devdoc-artifact-sec)",
};

function getSaveErrorMessage(error) {
  if (error.fields) return Object.values(error.fields)[0] || error.message || "Could not save section.";
  return error.message || "Could not save section.";
}

export default function DocumentEditor() {
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

  useUnsavedChangesWarning(hasUnsavedChanges);

  const [activeRibbonTab, setActiveRibbonTab] = useState("Home");
  const [editorFontFamily, setEditorFontFamily] = useState("Inter");
  const [editorFontSize, setEditorFontSize] = useState("16");
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showSectionRail, setShowSectionRail] = useState(true);
  const [showGuidancePanel, setShowGuidancePanel] = useState(true);
  const [, setWritingIssues] = useState(null);

  const documentQuery = useDocument(projectId, documentId);
  const overviewQuery = useProjectOverview(projectId);
  const linkedArtefactsQuery = useSectionLinkedArtefacts(projectId, documentId, selectedSectionId);
  const saveMutation = useUpdateDocumentSection(projectId, documentId);
  useAuthGuard(documentQuery.error, linkedArtefactsQuery.error, saveMutation.error);

  const document = documentQuery.data || null;
  const sections = useMemo(() => document?.sections || [], [document]);
  const isLoading = documentQuery.isLoading;
  const loadError = documentQuery.error ? (documentQuery.error.status === 404 ? "not-found" : "general") : "";
  const isSaving = saveMutation.isPending;

  const latestValidation = overviewQuery.data?.latestValidation || null;
  const canExport = Boolean(latestValidation && latestValidation.status === "COMPLETED" && latestValidation.errorCount === 0);
  const linkedArtefacts = linkedArtefactsQuery.data || null;
  const isLoadingLinkedArtefacts = linkedArtefactsQuery.isLoading && Boolean(selectedSectionId);
  const linkedArtefactsError = linkedArtefactsQuery.error ? "Could not load linked artefacts." : "";

  useEffect(() => {
    if (document && !selectedSectionId) {
      const highlightId = searchParams.get("highlight");
      const initial = document.sections?.find((s) => s.id === highlightId) || document.sections?.[0] || null;
      setSelectedSectionId(initial?.id || "");
      setEditorContent(initial?.content || "");
      editorContentRef.current = initial?.content || "";
      setHasUnsavedChanges(false);
    }
  }, [document, selectedSectionId, searchParams]);

  const selectedSection = useMemo(() => sections.find((s) => s.id === selectedSectionId) || null, [sections, selectedSectionId]);
  const selectedSectionIndex = useMemo(() => sections.findIndex((s) => s.id === selectedSectionId), [sections, selectedSectionId]);
  const completedSectionCount = useMemo(() => sections.filter((s) => s.status === "COMPLETE").length, [sections]);

  const canGoPrevious = selectedSectionIndex > 0;
  const canGoNext = selectedSectionIndex >= 0 && selectedSectionIndex < sections.length - 1;
  const getPreviousSection = () => (selectedSectionIndex <= 0 ? null : sections[selectedSectionIndex - 1] || null);
  const getNextSection = () => (selectedSectionIndex < 0 || selectedSectionIndex >= sections.length - 1 ? null : sections[selectedSectionIndex + 1] || null);

  function switchToSection(section, options = {}) {
    if (!section || section.id === selectedSectionId) return false;
    if (!options.skipConfirm && hasUnsavedChanges && !window.confirm("You have unsaved changes. Discard them?")) return false;
    setSelectedSectionId(section.id);
    setEditorContent(section.content || "");
    editorContentRef.current = section.content || "";
    setHasUnsavedChanges(false);
    setSaveError("");
    setSaveSuccess("");
    return true;
  }
  const handleSelectSection = (s) => switchToSection(s);
  const handlePreviousSection = () => switchToSection(getPreviousSection());
  const handleNextSection = () => switchToSection(getNextSection());

  function handleChangeContent(value) {
    setEditorContent(value);
    editorContentRef.current = value;
    setHasUnsavedChanges(true);
    setSaveError("");
    setSaveSuccess("");
  }

  async function saveCurrentSection(successMessage = "Section saved.", options = {}) {
    if (!selectedSection) return false;
    setSaveError("");
    if (!options.silent) setSaveSuccess("");
    const contentToSave = editorContent;
    try {
      await saveMutation.mutateAsync({ sectionId: selectedSection.id, content: contentToSave });
      if (editorContentRef.current === contentToSave) setHasUnsavedChanges(false);
      setLastSavedAt(new Date());
      if (!options.silent) { setSaveSuccess(successMessage); notify("Section saved.", { tone: "success" }); }
      return true;
    } catch (error) {
      setSaveError(error.status === 404 ? "Document or section not found." : getSaveErrorMessage(error));
      return false;
    }
  }

  useEffect(() => {
    if (!hasUnsavedChanges || isSaving || !selectedSection) return undefined;
    const timer = setTimeout(() => { saveCurrentSection("", { silent: true }); }, 3000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorContent, hasUnsavedChanges, isSaving, selectedSection]);

  const handleSaveSection = () => saveCurrentSection();
  async function handleSaveAndNext() {
    const nextSection = getNextSection();
    const didSave = await saveCurrentSection(nextSection ? "Section saved. Moved to next section." : "Section saved.");
    if (didSave && nextSection) {
      setSelectedSectionId(nextSection.id);
      setEditorContent(nextSection.content || "");
      editorContentRef.current = nextSection.content || "";
      setHasUnsavedChanges(false);
      setSaveError("");
    }
  }

  const pct = sections.length ? Math.round((completedSectionCount / sections.length) * 100) : 0;

  // ---- loading / error shells ----
  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "var(--devdoc-bg)" }}>
        <p className="font-mono text-sm text-[var(--devdoc-muted)]">Loading document…</p>
      </main>
    );
  }
  if (loadError === "not-found") {
    return (
      <main className="min-h-screen px-6 py-10" style={{ backgroundColor: "var(--devdoc-bg)" }}>
        <div className="mx-auto max-w-2xl rounded-lg border p-8 text-center" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
          <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--devdoc-muted)]">Not found</p>
          <h1 className="font-headline text-xl font-bold text-[var(--devdoc-text)]">Document not found</h1>
          <Link to={`/projects/${projectId}/documents`} className="mt-4 inline-flex text-sm font-medium text-[var(--devdoc-primary)]">← Back to documents</Link>
        </div>
      </main>
    );
  }

  const typeColor = TYPE_COLOR[document?.documentType] || "var(--devdoc-primary)";

  const savedLabel = isSaving ? "Saving…"
    : hasUnsavedChanges ? "Unsaved changes"
    : lastSavedAt ? `Saved · ${lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    : "All changes saved";

  return (
    <main className="flex h-screen flex-col text-[var(--devdoc-text)]" style={{ backgroundColor: "var(--devdoc-bg)" }}>
      {/* top bar */}
      <header className="flex flex-shrink-0 items-center gap-4 border-b px-5 py-3"
        style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
        <Link to={`/projects/${projectId}/documents`} className="flex items-center gap-1 text-sm text-[var(--devdoc-muted)] transition-colors hover:text-[var(--devdoc-text)]">
          <Icon size={16}><path d="M19 12H5M12 19l-7-7 7-7" /></Icon>
        </Link>
        <div className="flex min-w-0 items-center gap-3">
          <span className="rounded px-2 py-0.5 font-mono text-[11px] font-medium" style={{ color: typeColor, backgroundColor: `color-mix(in srgb, ${typeColor} 14%, transparent)` }}>
            {document?.documentType}
          </span>
          <h1 className="truncate font-headline text-lg font-semibold">{document?.title}</h1>
          <span className="rounded px-2 py-0.5 text-[10px] font-medium"
            style={document?.status === "COMPLETE" ? { color: "var(--devdoc-success)", backgroundColor: "var(--devdoc-success-soft)" } : { color: "var(--devdoc-muted)", backgroundColor: "var(--devdoc-surface-inset)" }}>
            {(document?.status || "DRAFT").toLowerCase()}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {/* save indicator */}
          <span className="flex items-center gap-1.5 font-mono text-[11px]"
            style={{ color: hasUnsavedChanges ? "var(--devdoc-warning)" : "var(--devdoc-muted)" }}>
            {isSaving && <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--devdoc-highlight)]" />}
            {savedLabel}
          </span>
          {/* panel toggles */}
          <button onClick={() => setShowSectionRail((v) => !v)} title="Toggle sections"
            className="rounded border p-1.5 text-[var(--devdoc-muted)] transition-colors hover:text-[var(--devdoc-text)]"
            style={{ borderColor: "var(--devdoc-border)", backgroundColor: showSectionRail ? "var(--devdoc-surface-inset)" : "transparent" }}>
            <Icon size={15}><path d="M3 3h7v18H3zM14 3h7v18h-7z" /></Icon>
          </button>
          <button onClick={() => setShowGuidancePanel((v) => !v)} title="Toggle guidance"
            className="rounded border p-1.5 text-[var(--devdoc-muted)] transition-colors hover:text-[var(--devdoc-text)]"
            style={{ borderColor: "var(--devdoc-border)", backgroundColor: showGuidancePanel ? "var(--devdoc-surface-inset)" : "transparent" }}>
            <Icon size={15}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></Icon>
          </button>
          <button onClick={() => setIsFocusMode((v) => !v)} title="Focus mode"
            className="rounded border p-1.5 text-[var(--devdoc-muted)] transition-colors hover:text-[var(--devdoc-text)]"
            style={{ borderColor: "var(--devdoc-border)", backgroundColor: isFocusMode ? "var(--devdoc-primary-soft)" : "transparent", color: isFocusMode ? "var(--devdoc-primary)" : undefined }}>
            <Icon size={15}><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" /></Icon>
          </button>
          <Link to={`/projects/${projectId}/documents/${documentId}/print`}
            className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors"
            style={canExport
              ? { borderColor: "var(--devdoc-primary)", color: "var(--devdoc-primary)" }
              : { borderColor: "var(--devdoc-border)", color: "var(--devdoc-subtle)", pointerEvents: "none", opacity: 0.6 }}
            title={canExport ? "Export document" : "Resolve validation errors to export"}>
            <Icon size={15}><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" /></Icon>
            Export
          </Link>
        </div>
      </header>

      {/* progress strip */}
      <div className="flex flex-shrink-0 items-center gap-3 border-b px-5 py-2" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-bg)" }}>
        <span className="font-mono text-[11px] text-[var(--devdoc-muted)]">{completedSectionCount} / {sections.length} sections</span>
        <div className="h-1 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: "var(--devdoc-surface-inset)" }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: "var(--devdoc-highlight)", transition: "width 400ms ease" }} />
        </div>
        <span className="font-mono text-[11px]" style={{ color: "var(--devdoc-highlight)" }}>{pct}%</span>
      </div>

      {/* body */}
      <div className="flex min-h-0 flex-1">
        {showSectionRail && !isFocusMode && (
          <div className="w-[300px] flex-shrink-0 overflow-y-auto border-r" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface-inset)" }}>
            <DocumentSectionSidebar
              sections={sections}
              selectedSectionId={selectedSectionId}
              onSelectSection={handleSelectSection}
              completedCount={completedSectionCount}
            />
          </div>
        )}

        <div className="min-w-0 flex-1 overflow-y-auto">
          <DocumentEditorPanel
            section={selectedSection}
            editorContent={editorContent}
            onChangeContent={handleChangeContent}
            onSave={handleSaveSection}
            onSaveAndNext={handleSaveAndNext}
            onPrevious={handlePreviousSection}
            onNext={handleNextSection}
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
            isSaving={isSaving}
            saveError={saveError}
            saveSuccess={saveSuccess}
            hasUnsavedChanges={hasUnsavedChanges}
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
          />
        </div>

        {showGuidancePanel && !isFocusMode && (
          <div className="w-[320px] flex-shrink-0 overflow-y-auto border-l p-4" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface-inset)" }}>
            <DocumentGuidancePanel
              section={selectedSection}
              linkedArtefacts={linkedArtefacts}
              isLoadingLinkedArtefacts={isLoadingLinkedArtefacts}
              linkedArtefactsError={linkedArtefactsError}
            />
          </div>
        )}
      </div>
    </main>
  );
}
