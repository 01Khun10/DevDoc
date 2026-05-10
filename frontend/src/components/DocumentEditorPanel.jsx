import { useRef } from "react";
import { useNavigate } from "react-router-dom";

function Badge({ children, tone = "slate" }) {
  const classes =
    tone === "amber"
      ? "bg-amber-50 text-amber-700 ring-amber-100"
      : "bg-slate-100 text-slate-700 ring-slate-200";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${classes}`}>
      {children}
    </span>
  );
}

function RibbonButton({ children, wide = false, onClick, disabled, isActive }) {
  return (
    <button
      className={`rounded border border-slate-200 px-3 py-1.5 text-xs font-semibold transition-all duration-200 hover:-translate-y-px hover:shadow-sm ${
        wide ? "min-w-24" : "min-w-8"
      } ${
        isActive
          ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm"
          : "bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900"
      } disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:shadow-none disabled:hover:translate-y-0 disabled:border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
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
      <section className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">No section selected</h2>
        <p className="mt-2 text-sm text-slate-600">Select a section to start editing.</p>
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
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start);
      }, 0);
    } else {
      const lineStart = text.lastIndexOf("\n", start - 1) + 1;
      let lineEnd = text.indexOf("\n", start);
      if (lineEnd === -1) lineEnd = text.length;

      const newText = text.substring(0, lineStart) + text.substring(lineEnd);
      onChangeContent(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(lineStart, lineStart);
      }, 0);
    }
  }

  const templates = {
    acceptanceCriteria: "Acceptance Criteria:\n- Given ...\n- When ...\n- Then ...\n",
    userStory: "As a [user],\nI want to [action],\nso that [benefit].\n",
    checklist: "- [ ] Item 1\n- [ ] Item 2\n- [ ] Item 3\n",
    table: "| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n| Value | Value | Value |\n",
    note: "Note:\n...\n"
  };

  function insertTemplate(templateKey) {
    insertTextAtCursor(templates[templateKey]);
  }

  function runWritingCheck() {
    const issues = [];
    const text = editorContent.trim();
    if (!text) {
      issues.push("Section is completely empty.");
    } else if (text.length < 50) {
      issues.push("Content is very short. Expand on your ideas.");
    }
    
    if (text && !/[.!?]$/.test(text)) {
      issues.push("Missing punctuation at the end of the section.");
    }

    const sentences = text.split(/[.!?]+/).filter(Boolean);
    const longSentences = sentences.filter(s => s.split(" ").length > 25);
    if (longSentences.length > 2) {
      issues.push("There are multiple very long sentences. Consider breaking them up.");
    }

    const weakWords = ["maybe", "probably", "stuff", "things", "good", "bad", "etc"];
    const foundWeak = weakWords.filter(w => new RegExp(`\\b${w}\\b`, 'i').test(text));
    if (foundWeak.length > 0) {
      issues.push(`Avoid weak or vague wording: ${foundWeak.join(", ")}`);
    }

    const passive = ["should be", "will be", "is to be", "are to be"];
    const foundPassive = passive.filter(w => new RegExp(`\\b${w}\\b`, 'i').test(text));
    if (foundPassive.length > 0) {
      issues.push(`Passive tone detected ("${foundPassive.join('", "')}"). Consider active voice.`);
    }

    if (issues.length === 0) {
      setWritingIssues(["No obvious writing issues found."]);
    } else {
      setWritingIssues(issues);
    }
    
    if (!showGuidancePanel) setShowGuidancePanel(true);
  }

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
            <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
              <select 
                className="rounded border border-slate-200 py-1.5 pl-2 pr-6 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={editorFontFamily}
                onChange={(e) => setEditorFontFamily(e.target.value)}
              >
                <option value="Inter">Inter</option>
                <option value="Manrope">Manrope</option>
                <option value="Arial">Arial</option>
                <option value="Georgia">Georgia</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
              </select>
              <select 
                className="rounded border border-slate-200 py-1.5 pl-2 pr-6 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={editorFontSize}
                onChange={(e) => setEditorFontSize(e.target.value)}
              >
                <option value="12">12</option>
                <option value="14">14</option>
                <option value="16">16</option>
                <option value="18">18</option>
                <option value="20">20</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-1 border-r border-slate-200 pr-4">
              <RibbonButton onClick={() => insertTextAtCursor("**", "**")}>B</RibbonButton>
              <RibbonButton onClick={() => insertTextAtCursor("*", "*")}>I</RibbonButton>
              <RibbonButton onClick={() => insertTextAtCursor("__", "__")}>U</RibbonButton>
            </div>
            <div className="flex flex-wrap gap-1 border-r border-slate-200 pr-4">
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
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-500">
        <span className="font-semibold uppercase tracking-wide">Paper editor</span>
        <span>Writing one structured section at a time</span>
      </div>

      <div className="rounded-sm border border-slate-200 bg-white shadow-xl shadow-slate-400/20">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 flex gap-1">
          {["File", "Home", "Insert", "Review", "View"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveRibbonTab(tab)}
              className={`rounded px-3 py-1 text-xs font-bold transition-colors ${
                tab === activeRibbonTab
                  ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-600 hover:bg-white"
              }`}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="border-b border-slate-200 bg-slate-50/50 px-4 py-3">
          {renderRibbonContent()}
        </div>

        <div className="border-b border-slate-100 px-6 py-6 sm:px-12 sm:py-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Section {section.sectionNumber}
                </p>
                <Badge tone={section.isRequired ? "amber" : "slate"}>
                  {section.isRequired ? "Required" : "Optional"}
                </Badge>
              </div>
              <h2 className="mt-3 text-2xl font-bold leading-tight text-slate-950 sm:text-3xl">
                {section.title}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
                disabled={!canGoPrevious || isSaving}
                type="button"
                onClick={onPrevious}
              >
                Previous Section
              </button>
              <button
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
                disabled={!canGoNext || isSaving}
                type="button"
                onClick={onNext}
              >
                Next Section
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 sm:px-12 sm:py-8">
          <textarea
            ref={textareaRef}
            className="min-h-[580px] w-full resize-y border-0 bg-white px-0 py-0 text-slate-950 outline-none placeholder:text-slate-400 focus:ring-0"
            style={textAreaStyle}
            maxLength={20000}
            placeholder={section.placeholderText || "Write this section here."}
            value={editorContent}
            onChange={(event) => onChangeContent(event.target.value)}
          />
          <div className="mt-4 flex justify-end border-t border-slate-100 pt-3 text-xs text-slate-500">
            {editorContent.length} / 20000
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-h-6">
            {hasUnsavedChanges && !saveError ? (
              <p className="text-sm font-medium text-amber-700">You have unsaved changes.</p>
            ) : null}
            {saveError ? <p className="text-sm font-medium text-red-700">{saveError}</p> : null}
            {saveSuccess ? (
              <p className="text-sm font-medium text-emerald-700">{saveSuccess}</p>
            ) : null}
            {!hasUnsavedChanges && !saveError && !saveSuccess ? (
              <p className="text-sm text-slate-500">Section is ready for editing.</p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-md border border-teal-200 bg-white px-4 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
              disabled={isSaving}
              type="button"
              onClick={onSave}
            >
              {isSaving ? "Saving..." : "Save Section"}
            </button>
            <button
              className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
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
