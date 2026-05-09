function DocumentEditorPanel({
  section,
  editorContent,
  onChangeContent,
  onSave,
  isSaving,
  saveError,
  saveSuccess,
  hasUnsavedChanges
}) {
  if (!section) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">No section selected</h2>
        <p className="mt-2 text-sm text-slate-600">Select a section to start editing.</p>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-[900px]">
      <div className="mb-3 flex items-center justify-between px-1 text-xs text-slate-500">
        <span className="font-semibold uppercase">Document page</span>
        <span>Editing one section at a time</span>
      </div>

      <div className="rounded-sm border border-slate-200 bg-white shadow-xl shadow-slate-400/20">
        <div className="border-b border-slate-100 px-8 py-8 sm:px-12">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Section {section.sectionNumber}
              </p>
              <h2 className="mt-2 text-3xl font-bold leading-tight text-slate-950">
                {section.title}
              </h2>
            </div>
            {hasUnsavedChanges ? (
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-100">
                Unsaved changes
              </span>
            ) : null}
          </div>
        </div>

        <div className="px-8 py-8 sm:px-12">
          <textarea
            className="min-h-[640px] w-full resize-y border-0 bg-white px-0 py-0 text-base leading-8 text-slate-950 outline-none placeholder:text-slate-400 focus:ring-0"
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

      <div className="mt-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          {hasUnsavedChanges && !saveError ? (
            <p className="text-sm font-medium text-amber-700">You have unsaved changes.</p>
          ) : null}
          {saveError ? <p className="text-sm font-medium text-red-700">{saveError}</p> : null}
          {saveSuccess ? (
            <p className="text-sm font-medium text-emerald-700">{saveSuccess}</p>
          ) : null}
        </div>
        <button
          className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={isSaving}
          type="button"
          onClick={onSave}
        >
          {isSaving ? "Saving..." : "Save Section"}
        </button>
      </div>
    </section>
  );
}

export default DocumentEditorPanel;
