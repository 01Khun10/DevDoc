function TemplateCard({ template, isSelected, onSelect }) {
  return (
    <button
      className="rounded-2xl p-5 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
      style={{
        border: `1px solid ${isSelected ? "var(--devdoc-primary)" : "var(--devdoc-border)"}`,
        backgroundColor: isSelected ? "var(--devdoc-primary-soft)" : "var(--devdoc-surface)",
        outline: isSelected ? `2px solid var(--devdoc-primary-soft)` : "none",
      }}
      type="button"
      onClick={() => onSelect(template)}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="font-headline text-base font-extrabold" style={{ color: "var(--devdoc-text)" }}>{template.name}</h3>
        <span
          className="rounded-full px-2.5 py-1 text-xs font-bold"
          style={{ backgroundColor: "var(--devdoc-surface-muted)", border: "1px solid var(--devdoc-border)", color: "var(--devdoc-muted)" }}
        >
          {template.documentType}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6" style={{ color: "var(--devdoc-muted)" }}>{template.description}</p>
      <p className="mt-4 text-xs font-semibold uppercase" style={{ color: "var(--devdoc-muted)" }}>Recommended for</p>
      <p className="mt-1 text-sm leading-6" style={{ color: "var(--devdoc-muted)" }}>{template.recommendedFor}</p>
    </button>
  );
}

export default TemplateCard;
