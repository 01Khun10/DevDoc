function TemplateCard({ template, isSelected, onSelect }) {
  return (
    <button
      className={`rounded-lg border bg-white p-5 text-left shadow-sm transition hover:border-teal-500 hover:bg-teal-50 ${
        isSelected ? "border-teal-600 ring-2 ring-teal-100" : "border-slate-200"
      }`}
      type="button"
      onClick={() => onSelect(template)}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-950">{template.name}</h3>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {template.documentType}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{template.description}</p>
      <p className="mt-4 text-xs font-semibold uppercase text-slate-500">Recommended for</p>
      <p className="mt-1 text-sm leading-6 text-slate-600">{template.recommendedFor}</p>
    </button>
  );
}

export default TemplateCard;
