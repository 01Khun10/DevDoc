import { useEffect, useState } from "react";

function isTypingTarget(target) {
  return Boolean(
    target?.closest?.('input, textarea, select, [contenteditable="true"], [role="dialog"], [role="listbox"]')
  );
}

// J/K to move focus through a registry list, E to edit, D to delete, Esc to clear.
// Focused card gets a primary outline ring via the returned focusedId.
export default function useKeyboardNav(items, { onEdit, onDelete } = {}) {
  const [focusedIndex, setFocusedIndex] = useState(-1);

  useEffect(() => {
    if (focusedIndex >= items.length) setFocusedIndex(items.length - 1);
  }, [items.length, focusedIndex]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;

      const key = event.key.toLowerCase();
      if (key === "j") {
        setFocusedIndex((index) => Math.min(index + 1, items.length - 1));
      } else if (key === "k") {
        setFocusedIndex((index) => Math.max(index - 1, 0));
      } else if (key === "escape") {
        setFocusedIndex(-1);
      } else if (key === "e" && focusedIndex >= 0 && items[focusedIndex]) {
        onEdit?.(items[focusedIndex]);
      } else if (key === "d" && focusedIndex >= 0 && items[focusedIndex]) {
        onDelete?.(items[focusedIndex]);
      } else {
        return;
      }
      event.preventDefault();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [items, focusedIndex, onEdit, onDelete]);

  const focusedId = focusedIndex >= 0 ? items[focusedIndex]?.id ?? null : null;

  useEffect(() => {
    if (!focusedId) return;
    document
      .getElementById(`artifact-${focusedId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [focusedId]);

  return { focusedId, clearFocus: () => setFocusedIndex(-1) };
}
