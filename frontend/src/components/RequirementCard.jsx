import { useEffect, useState } from "react";

function formatDate(value) {
  if (!value) {
    return "Unknown";
  }

  return new Date(value).toLocaleDateString();
}

function Badge({ children, tone = "slate" }) {
  const classes =
    tone === "teal"
      ? "bg-teal-50 text-teal-700 ring-teal-100"
      : tone === "amber"
        ? "bg-amber-50 text-amber-700 ring-amber-100"
        : "bg-slate-100 text-slate-700 ring-slate-200";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${classes}`}>
      {children}
    </span>
  );
}

function RequirementCard({ requirement, onUpdate }) {
  const [title, setTitle] = useState(requirement.title);
  const [description, setDescription] = useState(requirement.description || "");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState(
    requirement.acceptanceCriteria || ""
  );
  const [priority, setPriority] = useState(requirement.priority || "");
  const [status, setStatus] = useState(requirement.status);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setTitle(requirement.title);
    setDescription(requirement.description || "");
    setAcceptanceCriteria(requirement.acceptanceCriteria || "");
    setPriority(requirement.priority || "");
    setStatus(requirement.status);
  }, [requirement]);

  async function handleSave() {
    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await onUpdate(requirement.id, {
        title,
        description,
        priority: priority || null,
        status,
        acceptanceCriteria
      });
      setSuccessMessage("Changes saved.");
    } catch (error) {
      setErrorMessage(error.message || "Could not update requirement.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <Badge tone="teal">{requirement.code}</Badge>
            <Badge>{requirement.type}</Badge>
            <Badge tone={requirement.priority === "HIGH" ? "amber" : "slate"}>
              {requirement.priority || "No priority"}
            </Badge>
            <Badge>{requirement.status}</Badge>
          </div>

          <div className="mt-5 grid gap-4">
            <label className="block">
              <span className="text-xs font-semibold uppercase text-slate-500">Title</span>
              <input
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                maxLength={200}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase text-slate-500">Description</span>
              <textarea
                className="mt-2 min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-700 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                maxLength={5000}
                placeholder="No description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </label>
          </div>

          <label className="mt-4 block rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Acceptance criteria
            </p>
            <textarea
              className="mt-2 min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-700 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              maxLength={5000}
              placeholder="No acceptance criteria"
              value={acceptanceCriteria}
              onChange={(event) => setAcceptanceCriteria(event.target.value)}
            />
          </label>
          <p className="mt-4 text-xs text-slate-500">Created {formatDate(requirement.createdAt)}</p>
        </div>

        <div className="w-full rounded-md border border-slate-200 bg-slate-50 p-4 lg:w-72">
          <h4 className="text-sm font-semibold text-slate-950">Review fields</h4>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Code and type stay fixed after creation.
          </p>
          <div className="mt-4 grid gap-4">
            <label className="block">
              <span className="text-xs font-semibold uppercase text-slate-500">Priority</span>
              <select
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
              >
                <option value="">No priority</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase text-slate-500">Status</span>
              <select
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="PROPOSED">PROPOSED</option>
                <option value="APPROVED">APPROVED</option>
                <option value="IMPLEMENTED">IMPLEMENTED</option>
                <option value="VERIFIED">VERIFIED</option>
              </select>
            </label>

            {errorMessage ? <p className="text-sm text-red-700">{errorMessage}</p> : null}
            {successMessage ? <p className="text-sm text-emerald-700">{successMessage}</p> : null}

            <button
              className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={isSaving}
              type="button"
              onClick={handleSave}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default RequirementCard;
