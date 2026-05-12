import { useRef } from "react";
import { useNavigate } from "react-router-dom";

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
  const textareaRef = useRef(null);

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

  function insertTextAtCursor(prefix, suffix = "") {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = editorContent;
    const selectedText = text.substring(start, end);
    const newText = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end);
    onChangeContent(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  }

  function handleInsertPrefix(prefixText) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const text = editorContent;
    const lineStart = text.lastIndexOf("\n", start - 1) + 1;
    const newText = text.substring(0, lineStart) + prefixText + text.substring(lineStart);
    onChangeContent(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefixText.length, start + prefixText.length);
    }, 0);
  }

  function clearCurrentLine() {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = editorContent;
    if (start !== end) {
      const newText = text.substring(0, start) + text.substring(end);
      onChangeContent(newText);
      setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start, start); }, 0);
    } else {
      const lineStart = text.lastIndexOf("\n", start - 1) + 1;
      let lineEnd = text.indexOf("\n", start);
      if (lineEnd === -1) lineEnd = text.length;
      const newText = text.substring(0, lineStart) + text.substring(lineEnd);
      onChangeContent(newText);
      setTimeout(() => { textarea.focus(); textarea.setSelectionRange(lineStart, lineStart); }, 0);
    }
  }

  const templates = {
    acceptanceCriteria: "Acceptance Criteria:\n- Given ...\n- When ...\n- Then ...\n",
    userStory: "As a [user],\nI want to [action],\nso that [benefit].\n",
    checklist: "- [ ] Item 1\n- [ ] Item 2\n- [ ] Item 3\n",
    table: "| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n| Value | Value | Value |\n",
    note: "Note:\n...\n"
  };

  function insertTemplate(templateKey) { insertTextAtCursor(templates[templateKey]); }

  function runWritingCheck() {
    const issues = [];
    const text = editorContent.trim();
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
            <RibbonButton wide disabled>Export PDF (Coming Soon)</RibbonButton>
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
              <RibbonButton onClick={() => insertTextAtCursor("**", "**")}>B</RibbonButton>
              <RibbonButton onClick={() => insertTextAtCursor("*", "*")}>I</RibbonButton>
              <RibbonButton onClick={() => insertTextAtCursor("__", "__")}>U</RibbonButton>
            </div>
            <div className="flex flex-wrap gap-1 pr-4" style={{ borderRight: `1px solid var(--devdoc-border)` }}>
              <RibbonButton wide onClick={() => handleInsertPrefix("## ")}>Heading</RibbonButton>
              <RibbonButton wide onClick={() => handleInsertPrefix("- ")}>Bullet</RibbonButton>
              <RibbonButton wide onClick={() => handleInsertPrefix("1. ")}>Numbered</RibbonButton>
              <RibbonButton wide onClick={() => handleInsertPrefix("> ")}>Quote</RibbonButton>
            </div>
            <div className="flex flex-wrap gap-1">
              <RibbonButton wide onClick={clearCurrentLine}>Clear Line</RibbonButton>
            </div>
          </div>
        );
      case "Insert":
        return (
          <div className="flex flex-wrap gap-2">
            <RibbonButton wide onClick={() => insertTemplate('acceptanceCriteria')}>Acceptance Criteria</RibbonButton>
            <RibbonButton wide onClick={() => insertTemplate('userStory')}>User Story</RibbonButton>
            <RibbonButton wide onClick={() => insertTemplate('checklist')}>Checklist</RibbonButton>
            <RibbonButton wide onClick={() => insertTemplate('table')}>Table Template</RibbonButton>
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

  const textAreaStyle = {
    fontFamily: editorFontFamily === "Inter" ? "Inter, ui-sans-serif, system-ui, sans-serif" :
                editorFontFamily === "Manrope" ? "Manrope, ui-sans-serif, system-ui, sans-serif" :
                editorFontFamily === "Arial" ? "Arial, Helvetica, sans-serif" :
                editorFontFamily === "Georgia" ? "Georgia, serif" :
                editorFontFamily === "Times New Roman" ? "'Times New Roman', Times, serif" :
                editorFontFamily === "Courier New" ? "'Courier New', Courier, monospace" : "inherit",
    fontSize: `${editorFontSize}px`,
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

        {/* Textarea keeps a readable paper feel. */}
        <div className="px-6 py-6 sm:px-12 sm:py-8" style={{ backgroundColor: "var(--devdoc-paper, #ffffff)" }}>
          <textarea
            ref={textareaRef}
            className="min-h-[580px] w-full resize-y border-0 px-0 py-0 outline-none focus:ring-0"
            style={{
              ...textAreaStyle,
              backgroundColor: "var(--devdoc-paper, #ffffff)",
              color: "var(--devdoc-paper-text, #24292f)",
            }}
            maxLength={20000}
            placeholder={section.placeholderText || "Write this section here."}
            value={editorContent}
            onChange={(event) => onChangeContent(event.target.value)}
          />
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
    </section>
  );
}

export default DocumentEditorPanel;
