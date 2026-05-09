import { useEffect, useState } from "react";

function formatRequirementLabel(requirement) {
  return `${requirement.code} - ${requirement.title}`;
}

function formatSectionLabel(section) {
  return `${section.document.title} - Section ${section.sectionNumber} - ${section.title}`;
}

function TraceabilityLinkForm({
  requirements,
  documentSections,
  onCreate,
  isSubmitting,
  error
}) {
  const [sourceId, setSourceId] = useState("");
  const [targetId, setTargetId] = useState("");

  useEffect(() => {
    if (!sourceId && requirements.length > 0) {
      setSourceId(requirements[0].id);
    }
  }, [requirements, sourceId]);

  useEffect(() => {
    if (!targetId && documentSections.length > 0) {
      setTargetId(documentSections[0].id);
    }
  }, [documentSections, targetId]);

  async function handleSubmit(event) {
    event.preventDefault();

    await onCreate({
      sourceType: "REQUIREMENT",
      sourceId,
      targetType: "DOCUMENT_SECTION",
      targetId,
      linkType: "described_by"
    });
  }

  const cannotSubmit = isSubmitting || !sourceId || !targetId;

  return (
    <form
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-5">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Requirement</span>
          <select
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            value={sourceId}
            onChange={(event) => setSourceId(event.target.value)}
          >
            {requirements.map((requirement) => (
              <option key={requirement.id} value={requirement.id}>
                {formatRequirementLabel(requirement)}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Document section</span>
          <select
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            value={targetId}
            onChange={(event) => setTargetId(event.target.value)}
          >
            {documentSections.map((section) => (
              <option key={section.id} value={section.id}>
                {formatSectionLabel(section)}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          Link type: <span className="font-semibold text-slate-950">described_by</span>
        </div>
      </div>

      {error ? (
        <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-5 flex justify-end">
        <button
          className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={cannotSubmit}
          type="submit"
        >
          {isSubmitting ? "Creating..." : "Create Link"}
        </button>
      </div>
    </form>
  );
}

export default TraceabilityLinkForm;
