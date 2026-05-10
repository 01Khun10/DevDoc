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
}) {
  if (!section) {
    return (
      <section className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">No section selected</h2>
        <p className="mt-2 text-sm text-slate-600">Select a section to start editing.</p>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-[940px]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-500">
        <span className="font-semibold uppercase tracking-wide">Paper editor</span>
        <span>Writing one structured section at a time</span>
      </div>

      <div className="rounded-sm border border-slate-200 bg-white shadow-xl shadow-slate-400/20">
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
            className="min-h-[580px] w-full resize-y border-0 bg-white px-0 py-0 text-base leading-8 text-slate-950 outline-none placeholder:text-slate-400 focus:ring-0"
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
