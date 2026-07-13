import { useEffect, useRef, useState } from "react";

// Clickable badge that opens a small popover of options and saves immediately on select.
function InlineBadgeSelect({ value, options, onSelect, placeholder = "None", badgeStyle = {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleOutside(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen]);

  async function handlePick(option) {
    setIsOpen(false);
    if (option === value) return;
    setIsSaving(true);
    try {
      await onSelect(option);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <span className="relative inline-flex" ref={rootRef}>
      <button
        type="button"
        className="rounded-full px-2.5 py-1 text-xs font-bold transition hover:opacity-80"
        style={{
          backgroundColor: "var(--devdoc-surface-muted)",
          border: "1px solid var(--devdoc-border)",
          color: "var(--devdoc-muted)",
          cursor: "pointer",
          ...badgeStyle
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={isSaving}
        onClick={() => setIsOpen((open) => !open)}
      >
        {isSaving ? (
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent align-middle" />
        ) : (
          <>{value || placeholder} ▾</>
        )}
      </button>
      {isOpen ? (
        <div
          className="absolute left-0 top-full z-20 mt-1 min-w-36 rounded-lg border py-1 shadow-lg"
          style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
          role="listbox"
        >
          {options.map((option) => (
            <button
              key={option || "none"}
              type="button"
              role="option"
              aria-selected={option === value}
              className="block w-full px-3 py-1.5 text-left text-xs font-semibold transition hover:opacity-70"
              style={{
                color: option === value ? "var(--devdoc-primary)" : "var(--devdoc-text)",
                backgroundColor: option === value ? "var(--devdoc-primary-soft)" : "transparent"
              }}
              onClick={() => handlePick(option)}
            >
              {option || placeholder}
            </button>
          ))}
        </div>
      ) : null}
    </span>
  );
}

export default InlineBadgeSelect;
