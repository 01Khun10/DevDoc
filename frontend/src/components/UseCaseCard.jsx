import { useEffect, useState } from "react";

function formatDate(value) {
  if (!value) {
    return "Unknown";
  }

  return new Date(value).toLocaleDateString();
}

function UseCaseCard({ useCase, onUpdate }) {
  const [title, setTitle] = useState(useCase.title);
  const [description, setDescription] = useState(useCase.description || "");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setTitle(useCase.title);
    setDescription(useCase.description || "");
  }, [useCase]);

  async function handleSave() {
    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await onUpdate(useCase.id, {
        title,
        description
      });
      setSuccessMessage("Changes saved.");
    } catch (error) {
      setErrorMessage(error.message || "Could not update use case.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <article className="devdoc-card-border p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 ring-1 ring-indigo-100">
              {useCase.code}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
              Use Case
            </span>
          </div>

          <div className="mt-5 grid gap-4">
            <label className="block">
              <span className="devdoc-label">Title</span>
              <input
                className="devdoc-soft-input mt-2 w-full font-semibold"
                maxLength={200}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>

            <label className="block">
              <span className="devdoc-label">Description</span>
              <textarea
                className="devdoc-soft-input mt-2 min-h-28 w-full leading-6"
                maxLength={5000}
                placeholder="No description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </label>
          </div>

          <p className="mt-4 text-xs text-slate-500">Created {formatDate(useCase.createdAt)}</p>
        </div>

        <div className="w-full rounded-2xl bg-slate-50 p-4 lg:w-64">
          <h4 className="text-sm font-semibold text-slate-950">Scenario details</h4>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Code stays fixed after creation.
          </p>

          {errorMessage ? <p className="mt-4 text-sm text-red-700">{errorMessage}</p> : null}
          {successMessage ? (
            <p className="mt-4 text-sm text-emerald-700">{successMessage}</p>
          ) : null}

          <button
            className="devdoc-gradient-button mt-4 w-full"
            disabled={isSaving}
            type="button"
            onClick={handleSave}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default UseCaseCard;
