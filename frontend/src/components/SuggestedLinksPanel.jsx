import { useState } from "react";
import { useCreateTraceabilityLink, useTraceabilitySuggestions } from "../api/traceability";
import { useNotify } from "../context/NotificationContext";

const suggestionKey = (s) => `${s.sourceType}:${s.sourceId}>${s.targetType}:${s.targetId}`;

function findArtefact(type, artefactId, options) {
  const pool =
    type === "USE_CASE"
      ? options.useCases
      : type === "REQUIREMENT"
        ? options.requirements
        : options.documentSections;
  return pool.find((item) => item.id === artefactId) || null;
}

function artefactLabel(type, artefactId, options) {
  const artefact = findArtefact(type, artefactId, options);
  if (!artefact) return "Unknown";
  if (type === "DOCUMENT_SECTION") {
    return `${artefact.sectionNumber ? `${artefact.sectionNumber} ` : ""}${artefact.title}`;
  }
  return `${artefact.code} ${artefact.title}`;
}

// Deterministic TF-IDF suggestions from the backend; Accept creates a real
// link, Dismiss hides the card for this session only.
function SuggestedLinksPanel({ projectId, options }) {
  const { notify } = useNotify();
  const [dismissed, setDismissed] = useState(() => new Set());
  const [acceptingKey, setAcceptingKey] = useState("");
  const suggestionsQuery = useTraceabilitySuggestions(projectId);
  const createMutation = useCreateTraceabilityLink(projectId);

  const suggestions = (suggestionsQuery.data || []).filter(
    (suggestion) => !dismissed.has(suggestionKey(suggestion))
  );

  if (suggestionsQuery.isLoading || suggestions.length === 0) return null;

  async function handleAccept(suggestion) {
    const key = suggestionKey(suggestion);
    setAcceptingKey(key);
    try {
      await createMutation.mutateAsync({
        sourceType: suggestion.sourceType,
        sourceId: suggestion.sourceId,
        targetType: suggestion.targetType,
        targetId: suggestion.targetId,
        linkType: suggestion.linkType
      });
      notify("Suggested link accepted.", { tone: "success" });
    } catch (error) {
      notify(error.message || "Could not create the suggested link.", { tone: "error" });
    } finally {
      setAcceptingKey("");
    }
  }

  function handleDismiss(suggestion) {
    setDismissed((current) => new Set(current).add(suggestionKey(suggestion)));
  }

  return (
    <section
      className="mb-5 rounded-xl border p-4"
      style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
    >
      <div className="mb-3 flex items-center gap-2">
        <p className="devdoc-label">Suggested links</p>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-bold"
          style={{ backgroundColor: "var(--devdoc-primary-soft)", color: "var(--devdoc-primary)" }}
        >
          {suggestions.length}
        </span>
        <span className="text-xs" style={{ color: "var(--devdoc-muted)" }}>
          Based on shared wording between unlinked requirements and your sections and use cases.
        </span>
      </div>
      <div className="grid gap-2.5 lg:grid-cols-2">
        {suggestions.map((suggestion) => {
          const key = suggestionKey(suggestion);
          return (
            <article
              key={key}
              className="rounded-lg border p-3"
              style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface-muted)" }}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="min-w-0 truncate text-sm font-semibold" style={{ color: "var(--devdoc-text)" }}>
                  {artefactLabel(suggestion.sourceType, suggestion.sourceId, options)}
                  <span className="mx-1.5 font-normal" style={{ color: "var(--devdoc-muted)" }}>
                    {suggestion.linkType}
                  </span>
                  {artefactLabel(suggestion.targetType, suggestion.targetId, options)}
                </p>
                <span
                  className="shrink-0 rounded-md px-2 py-0.5 text-xs font-bold"
                  style={{ backgroundColor: "var(--devdoc-primary-soft)", color: "var(--devdoc-primary)" }}
                  title="TF-IDF cosine similarity"
                >
                  {Math.round(suggestion.score * 100)}%
                </span>
              </div>
              {suggestion.reasonTerms?.length ? (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs" style={{ color: "var(--devdoc-muted)" }}>Shared terms:</span>
                  {suggestion.reasonTerms.map((term) => (
                    <span
                      key={term}
                      className="rounded-md border px-1.5 py-0.5 text-xs font-semibold"
                      style={{
                        borderColor: "var(--devdoc-border)",
                        backgroundColor: "var(--devdoc-surface)",
                        color: "var(--devdoc-text-secondary)"
                      }}
                    >
                      {term}
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="mt-3 flex gap-2">
                <button
                  className="rounded-lg px-3 py-1.5 text-xs font-bold text-white transition disabled:opacity-50"
                  style={{ backgroundColor: "var(--devdoc-primary)" }}
                  type="button"
                  disabled={Boolean(acceptingKey)}
                  onClick={() => handleAccept(suggestion)}
                >
                  {acceptingKey === key ? "Linking..." : "Accept"}
                </button>
                <button
                  className="rounded-lg border px-3 py-1.5 text-xs font-bold transition"
                  style={{
                    borderColor: "var(--devdoc-border)",
                    backgroundColor: "var(--devdoc-surface)",
                    color: "var(--devdoc-muted)"
                  }}
                  type="button"
                  onClick={() => handleDismiss(suggestion)}
                >
                  Dismiss
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default SuggestedLinksPanel;
