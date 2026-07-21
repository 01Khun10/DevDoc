import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import RequirementBlock from "./RequirementBlockExtension";
import { Modal } from "./ui";
import { useCreateRequirementFromSection } from "../api/requirements";
import { useNotify } from "../context/NotificationContext";

const EDITOR_EXTENSIONS = [
  StarterKit,
  Table.configure({ resizable: false }),
  TableRow,
  TableHeader,
  TableCell,
  RequirementBlock
];

// Sections saved before Phase 9 hold plain text; wrap each line in a
// paragraph so TipTap renders it. Already-HTML content passes through.
function toEditorHtml(content) {
  if (!content) return "";
  if (/^\s*</.test(content)) return content;

  const escaped = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped
    .split(/\n+/)
    .filter((line) => line.trim())
    .map((line) => `<p>${line}</p>`)
    .join("");
}

function Badge({ children, tone = "slate" }) {
  const colorMap = {
    amber:  { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)", color: "#b45309" },
    slate:  { bg: "var(--devdoc-surface-muted)", border: "var(--devdoc-border)", color: "var(--devdoc-muted)" },
  };
  const s = colorMap[tone] || colorMap.slate;
  return (
    <span
      className="rounded-full px-2.5 py-1 text-xs font-bold"
      style={{ backgroundColor: s.bg, border: `1px solid ${s.border}`, color: s.color }}
    >
      {children}
    </span>
  );
}

function RibbonButton({ children, wide = false, onClick, disabled, isActive }) {
  return (
    <button
      className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all ${wide ? "min-w-24" : "min-w-8"}`}
      style={{
        border: `1px solid ${isActive ? "var(--devdoc-primary)" : "var(--devdoc-border)"}`,
        backgroundColor: isActive ? "var(--devdoc-primary-soft)" : "var(--devdoc-surface)",
        color: isActive ? "var(--devdoc-primary)" : "var(--devdoc-text)",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  );
}

const fieldStyle = {
  border: "1px solid var(--devdoc-border)",
  backgroundColor: "var(--devdoc-surface-inset)",
  color: "var(--devdoc-text)",
  borderRadius: "8px",
  padding: "0.5rem 0.75rem",
  fontSize: "0.875rem",
  width: "100%",
  outline: "none",
};

function DocumentEditorPanel({
  section,
  editorContent,
  onChangeContent,
  onSave,
  onSaveAndNext,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  isSaving,
  saveError,
  saveSuccess,
  hasUnsavedChanges,
  activeRibbonTab,
  setActiveRibbonTab,
  editorFontFamily,
  setEditorFontFamily,
  editorFontSize,
  setEditorFontSize,
  isFocusMode,
  setIsFocusMode,
  showSectionRail,
  setShowSectionRail,
  showGuidancePanel,
  setShowGuidancePanel,
  setWritingIssues,
  projectId
}) {
  const navigate = useNavigate();
  const { notify } = useNotify();
  const editorWrapperRef = useRef(null);
  const [captureButton, setCaptureButton] = useState(null);
  const [captureForm, setCaptureForm] = useState(null);
  const [captureError, setCaptureError] = useState("");
  const createFromSection = useCreateRequirementFromSection(projectId);

  const editor = useEditor({
    extensions: EDITOR_EXTENSIONS,
    content: "",
    shouldRerenderOnTransaction: true,
    onUpdate: ({ editor: instance }) => {
      onChangeContent(instance.getHTML());
    }
  });

  const sectionId = section?.id || "";

  // Load the selected section into the editor (emitUpdate: false so switching
  // sections does not count as an unsaved change).
  useEffect(() => {
    if (!editor || !sectionId) return;
    editor.commands.setContent(toEditorHtml(section?.content || ""), { emitUpdate: false });
    setCaptureButton(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, sectionId]);

  // Show a floating "Register as requirement" button above non-empty selections.
  useEffect(() => {
    if (!editor) return;

    function handleSelectionUpdate() {
      const { from, to, empty } = editor.state.selection;
      const text = empty ? "" : editor.state.doc.textBetween(from, to, " ").trim();

      if (!text) {
        setCaptureButton(null);
        return;
      }

      const wrapper = editorWrapperRef.current?.getBoundingClientRect();
      if (!wrapper) return;

      const coords = editor.view.coordsAtPos(from);
      setCaptureButton({
        top: coords.top - wrapper.top - 38,
        left: Math.max(0, coords.left - wrapper.left),
        text,
        to
      });
    }

    editor.on("selectionUpdate", handleSelectionUpdate);
    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor]);

  if (!section) {
    return (
      <section
        className="rounded-2xl border border-dashed p-8 text-center"
        style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)", color: "var(--devdoc-muted)" }}
      >
        <p className="text-lg font-semibold" style={{ color: "var(--devdoc-text)" }}>No section selected</p>
        <p className="mt-2 text-sm">Select a section to start editing.</p>
      </section>
    );
  }

  function openCaptureModal() {
    if (!captureButton) return;
    setCaptureError("");
    setCaptureForm({
      title: captureButton.text.slice(0, 200),
      type: "FR",
      priority: "MEDIUM",
      insertAt: captureButton.to
    });
  }

  async function handleConfirmCapture() {
    if (!captureForm || !captureForm.title.trim()) {
      setCaptureError("Title is required.");
      return;
    }

    try {
      const requirement = await createFromSection.mutateAsync({
        sectionId: section.id,
        title: captureForm.title.trim(),
        type: captureForm.type,
        priority: captureForm.priority
      });

      editor
        .chain()
        .focus()
        .insertContentAt(captureForm.insertAt, {
          type: "requirementBlock",
          attrs: {
            code: requirement.code,
            title: requirement.title,
            reqType: requirement.type
          }
        })
        .run();

      setCaptureForm(null);
      setCaptureButton(null);
      notify(`${requirement.code} registered from this section.`, { tone: "success" });
    } catch (error) {
      setCaptureError(
        (error.fields && Object.values(error.fields)[0]) ||
          error.message ||
          "Could not register requirement."
      );
    }
  }

  const templates = {
    acceptanceCriteria:
      "<p><strong>Acceptance Criteria:</strong></p><ul><li>Given ...</li><li>When ...</li><li>Then ...</li></ul>",
    userStory: "<p>As a [user], I want to [action], so that [benefit].</p>",
    checklist: "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>",
    note: "<blockquote><p>Note: ...</p></blockquote>"
  };

  function insertTemplate(templateKey) {
    editor?.chain().focus().insertContent(templates[templateKey]).run();
  }

  function runWritingCheck() {
    const issues = [];
    const text = (editor?.getText() || "").trim();
    if (!text) issues.push("Section is completely empty.");
    else if (text.length < 50) issues.push("Content is very short. Expand on your ideas.");
    if (text && !/[.!?]$/.test(text)) issues.push("Missing punctuation at the end of the section.");
    const sentences = text.split(/[.!?]+/).filter(Boolean);
    const longSentences = sentences.filter(s => s.split(" ").length > 25);
    if (longSentences.length > 2) issues.push("There are multiple very long sentences. Consider breaking them up.");
    const weakWords = ["maybe", "probably", "stuff", "things", "good", "bad", "etc"];
    const foundWeak = weakWords.filter(w => new RegExp(`\\b${w}\\b`, 'i').test(text));
    if (foundWeak.length > 0) issues.push(`Avoid weak or vague wording: ${foundWeak.join(", ")}`);
    const passive = ["should be", "will be", "is to be", "are to be"];
    const foundPassive = passive.filter(w => new RegExp(`\\b${w}\\b`, 'i').test(text));
    if (foundPassive.length > 0) issues.push(`Passive tone detected ("${foundPassive.join('", "')}"). Consider active voice.`);
    setWritingIssues(issues.length === 0 ? ["No obvious writing issues found."] : issues);
    if (!showGuidancePanel) setShowGuidancePanel(true);
  }

  const selectStyle = {
    border: `1px solid var(--devdoc-border)`,
    backgroundColor: "var(--devdoc-surface-inset)",
    color: "var(--devdoc-text)",
    borderRadius: "6px",
    padding: "0.25rem 0.5rem",
    fontSize: "0.75rem",
    outline: "none",
  };

  function renderRibbonContent() {
    switch (activeRibbonTab) {
      case "File":
        return (
          <div className="flex flex-wrap gap-2">
            <RibbonButton wide onClick={onSave} disabled={isSaving}>Save Section</RibbonButton>
            <RibbonButton wide onClick={onSaveAndNext} disabled={isSaving}>Save & Next</RibbonButton>
            <RibbonButton wide onClick={() => navigate(`/projects/${projectId}`)}>Back to Project</RibbonButton>
          </div>
        );
      case "Home":
        return (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 pr-4" style={{ borderRight: `1px solid var(--devdoc-border)` }}>
              <select style={selectStyle} value={editorFontFamily} onChange={(e) => setEditorFontFamily(e.target.value)}>
                <option value="Inter">Inter</option>
                <option value="Manrope">Manrope</option>
                <option value="Arial">Arial</option>
                <option value="Georgia">Georgia</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
              </select>
              <select style={selectStyle} value={editorFontSize} onChange={(e) => setEditorFontSize(e.target.value)}>
                {["12","14","16","18","20"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex flex-wrap gap-1 pr-4" style={{ borderRight: `1px solid var(--devdoc-border)` }}>
              <RibbonButton isActive={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()}>B</RibbonButton>
              <RibbonButton isActive={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()}>I</RibbonButton>
            </div>
            <div className="flex flex-wrap gap-1 pr-4" style={{ borderRight: `1px solid var(--devdoc-border)` }}>
              <RibbonButton wide isActive={editor?.isActive("heading", { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>Heading</RibbonButton>
              <RibbonButton wide isActive={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()}>Bullet</RibbonButton>
              <RibbonButton wide isActive={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>Numbered</RibbonButton>
              <RibbonButton wide isActive={editor?.isActive("blockquote")} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>Quote</RibbonButton>
            </div>
            <div className="flex flex-wrap gap-1">
              <RibbonButton wide disabled={!editor?.can().undo()} onClick={() => editor?.chain().focus().undo().run()}>Undo</RibbonButton>
              <RibbonButton wide disabled={!editor?.can().redo()} onClick={() => editor?.chain().focus().redo().run()}>Redo</RibbonButton>
            </div>
          </div>
        );
      case "Insert":
        return (
          <div className="flex flex-wrap gap-2">
            <RibbonButton
              wide
              onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            >
              Insert Table
            </RibbonButton>
            <RibbonButton wide disabled={!editor?.isActive("table")} onClick={() => editor?.chain().focus().addRowAfter().run()}>Add Row</RibbonButton>
            <RibbonButton wide disabled={!editor?.isActive("table")} onClick={() => editor?.chain().focus().addColumnAfter().run()}>Add Column</RibbonButton>
            <RibbonButton wide disabled={!editor?.isActive("table")} onClick={() => editor?.chain().focus().deleteTable().run()}>Delete Table</RibbonButton>
            <RibbonButton wide onClick={() => insertTemplate('acceptanceCriteria')}>Acceptance Criteria</RibbonButton>
            <RibbonButton wide onClick={() => insertTemplate('userStory')}>User Story</RibbonButton>
            <RibbonButton wide onClick={() => insertTemplate('checklist')}>Checklist</RibbonButton>
            <RibbonButton wide onClick={() => insertTemplate('note')}>Note</RibbonButton>
          </div>
        );
      case "Review":
        return (
          <div className="flex flex-wrap gap-2">
            <RibbonButton wide onClick={runWritingCheck}>Run Writing Check</RibbonButton>
          </div>
        );
      case "View":
        return (
          <div className="flex flex-wrap gap-2">
            <RibbonButton wide isActive={isFocusMode} onClick={() => setIsFocusMode(!isFocusMode)}>Focus Mode</RibbonButton>
            <RibbonButton wide isActive={showSectionRail} onClick={() => setShowSectionRail(!showSectionRail)} disabled={isFocusMode}>Show Section Rail</RibbonButton>
            <RibbonButton wide isActive={showGuidancePanel} onClick={() => setShowGuidancePanel(!showGuidancePanel)} disabled={isFocusMode}>Show Guidance Panel</RibbonButton>
          </div>
        );
      default:
        return null;
    }
  }

  const editorStyle = {
    fontFamily: editorFontFamily === "Inter" ? "Inter, ui-sans-serif, system-ui, sans-serif" :
                editorFontFamily === "Manrope" ? "Manrope, ui-sans-serif, system-ui, sans-serif" :
                editorFontFamily === "Arial" ? "Arial, Helvetica, sans-serif" :
                editorFontFamily === "Georgia" ? "Georgia, serif" :
                editorFontFamily === "Times New Roman" ? "'Times New Roman', Times, serif" :
                editorFontFamily === "Courier New" ? "'Courier New', Courier, monospace" : "inherit",
    fontSize: `${editorFontSize}px`,
    backgroundColor: "var(--devdoc-paper)",
    color: "var(--devdoc-paper-text)",
  };

  return (
    <section className="mx-auto w-full max-w-[940px]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs" style={{ color: "var(--devdoc-muted)" }}>
        <span className="font-semibold uppercase tracking-wide">Paper editor</span>
        <span>Writing one structured section at a time</span>
      </div>

      {/* Editor card */}
      <div
        className="overflow-hidden rounded-2xl shadow-[var(--devdoc-shadow)]"
        style={{ border: `1px solid var(--devdoc-border)`, backgroundColor: "var(--devdoc-surface)" }}
      >
        {/* Tab bar */}
        <div
          className="flex gap-0.5 border-b px-3 py-2"
          style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface-muted)" }}
        >
          {["File", "Home", "Insert", "Review", "View"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveRibbonTab(tab)}
              className="rounded-lg px-3 py-1 text-xs font-bold transition"
              style={{
                backgroundColor: tab === activeRibbonTab ? "var(--devdoc-surface)" : "transparent",
                color: tab === activeRibbonTab ? "var(--devdoc-primary)" : "var(--devdoc-muted)",
                border: tab === activeRibbonTab ? `1px solid var(--devdoc-border)` : "1px solid transparent",
              }}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Ribbon content */}
        <div
          className="border-b px-4 py-3"
          style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface-muted)" }}
        >
          {renderRibbonContent()}
        </div>

        {/* Section header */}
        <div
          className="border-b px-6 py-6 sm:px-12 sm:py-8"
          style={{ borderColor: "var(--devdoc-border)" }}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="devdoc-label">Section {section.sectionNumber}</p>
                <Badge tone={section.isRequired ? "amber" : "slate"}>
                  {section.isRequired ? "Required" : "Optional"}
                </Badge>
              </div>
              <h2 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl" style={{ color: "var(--devdoc-text)" }}>
                {section.title}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                className="rounded-full px-3 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  border: `1px solid var(--devdoc-border)`,
                  backgroundColor: "var(--devdoc-surface)",
                  color: "var(--devdoc-text)",
                }}
                disabled={!canGoPrevious || isSaving}
                type="button"
                onClick={onPrevious}
              >
                Previous Section
              </button>
              <button
                className="rounded-full px-3 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  border: `1px solid var(--devdoc-border)`,
                  backgroundColor: "var(--devdoc-surface)",
                  color: "var(--devdoc-text)",
                }}
                disabled={!canGoNext || isSaving}
                type="button"
                onClick={onNext}
              >
                Next Section
              </button>
            </div>
          </div>
        </div>

        {/* Rich text editor with a readable paper feel. */}
        <div className="px-6 py-6 sm:px-12 sm:py-8" style={{ backgroundColor: "var(--devdoc-paper)" }}>
          <div ref={editorWrapperRef} className="relative">
            {captureButton ? (
              <button
                className="absolute z-10 rounded-lg px-3 py-1.5 text-xs font-bold shadow-[var(--devdoc-shadow)]"
                style={{
                  top: `${captureButton.top}px`,
                  left: `${captureButton.left}px`,
                  border: "1px solid var(--devdoc-primary)",
                  backgroundColor: "var(--devdoc-surface)",
                  color: "var(--devdoc-primary)",
                }}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={openCaptureModal}
              >
                Register as requirement
              </button>
            ) : null}
            <EditorContent editor={editor} className="devdoc-tiptap" style={editorStyle} />
          </div>
          <div className="mt-4 flex justify-end border-t pt-3 text-xs" style={{ borderColor: "var(--devdoc-border)", color: "var(--devdoc-muted)" }}>
            {editorContent.length} / 20000
          </div>
        </div>
      </div>

      {/* Save bar */}
      <div
        className="mt-4 rounded-2xl px-4 py-3 shadow-[var(--devdoc-shadow-soft)]"
        style={{ border: `1px solid var(--devdoc-border)`, backgroundColor: "var(--devdoc-surface)" }}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-h-6">
            {hasUnsavedChanges && !saveError ? (
              <p className="text-sm font-medium" style={{ color: "var(--devdoc-warning)" }}>You have unsaved changes.</p>
            ) : null}
            {saveError ? <p className="text-sm font-medium" style={{ color: "var(--devdoc-error)" }}>{saveError}</p> : null}
            {saveSuccess ? <p className="text-sm font-medium" style={{ color: "var(--devdoc-success)" }}>{saveSuccess}</p> : null}
            {!hasUnsavedChanges && !saveError && !saveSuccess ? (
              <p className="text-sm" style={{ color: "var(--devdoc-muted)" }}>Section is ready for editing.</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="devdoc-button-secondary disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                border: `1px solid var(--devdoc-border)`,
                backgroundColor: "var(--devdoc-surface)",
                color: "var(--devdoc-text)",
              }}
              disabled={isSaving}
              type="button"
              onClick={onSave}
            >
              {isSaving ? "Saving..." : "Save Section"}
            </button>
            <button
              className="devdoc-gradient-button"
              disabled={isSaving}
              type="button"
              onClick={onSaveAndNext}
            >
              {isSaving ? "Saving..." : "Save & Next"}
            </button>
          </div>
        </div>
      </div>

      {/* Inline requirement capture */}
      <Modal
        isOpen={Boolean(captureForm)}
        title="Register as requirement"
        onClose={() => setCaptureForm(null)}
        footer={
          <div className="flex justify-end gap-2">
            <button
              className="devdoc-button-secondary"
              style={{
                border: "1px solid var(--devdoc-border)",
                backgroundColor: "var(--devdoc-surface)",
                color: "var(--devdoc-text)",
              }}
              type="button"
              onClick={() => setCaptureForm(null)}
            >
              Cancel
            </button>
            <button
              className="devdoc-gradient-button"
              type="button"
              disabled={createFromSection.isPending}
              onClick={handleConfirmCapture}
            >
              {createFromSection.isPending ? "Creating..." : "Create Requirement"}
            </button>
          </div>
        }
      >
        {captureForm ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm" style={{ color: "var(--devdoc-muted)" }}>
              Creates the requirement and links it to this section in one step.
            </p>
            <label className="flex flex-col gap-1 text-sm font-semibold" style={{ color: "var(--devdoc-text)" }}>
              Title
              <input
                style={fieldStyle}
                value={captureForm.title}
                maxLength={200}
                onChange={(event) => setCaptureForm({ ...captureForm, title: event.target.value })}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-sm font-semibold" style={{ color: "var(--devdoc-text)" }}>
                Type
                <select
                  style={fieldStyle}
                  value={captureForm.type}
                  onChange={(event) => setCaptureForm({ ...captureForm, type: event.target.value })}
                >
                  <option value="FR">Functional (FR)</option>
                  <option value="NFR">Non-Functional (NFR)</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm font-semibold" style={{ color: "var(--devdoc-text)" }}>
                Priority
                <select
                  style={fieldStyle}
                  value={captureForm.priority}
                  onChange={(event) => setCaptureForm({ ...captureForm, priority: event.target.value })}
                >
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </label>
            </div>
            {captureError ? (
              <p className="text-sm font-medium" style={{ color: "var(--devdoc-error)" }}>{captureError}</p>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </section>
  );
}

export default DocumentEditorPanel;
