import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import apiRequest from "../services/api";

const TYPE_META = {
  PROJECT: { color: "var(--devdoc-primary)", label: "P" },
  REQUIREMENT: { color: "var(--devdoc-artifact-fr)", label: "RQ" },
  USE_CASE: { color: "var(--devdoc-artifact-uc)", label: "UC" },
  DOCUMENT: { color: "var(--devdoc-artifact-sec)", label: "DOC" },
  DESIGN_ELEMENT: { color: "var(--devdoc-artifact-de)", label: "DE" },
  TEST_CASE: { color: "var(--devdoc-artifact-tc)", label: "TC" }
};

function resultPath(result) {
  switch (result.type) {
    case "PROJECT":
      return `/projects/${result.projectId}`;
    case "DOCUMENT":
      return `/projects/${result.projectId}/documents/${result.id}`;
    case "REQUIREMENT":
      return `/projects/${result.projectId}/requirements?highlight=${result.id}`;
    case "USE_CASE":
      return `/projects/${result.projectId}/use-cases?highlight=${result.id}`;
    case "DESIGN_ELEMENT":
      return `/projects/${result.projectId}/design-elements?highlight=${result.id}`;
    case "TEST_CASE":
      return `/projects/${result.projectId}/test-cases?highlight=${result.id}`;
    default:
      return "/dashboard";
  }
}

async function searchApi(query) {
  const response = await apiRequest(`/api/search?q=${encodeURIComponent(query)}&limit=10`);
  return response.results || [];
}

function GlobalSearch() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results, isFetching } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => searchApi(debouncedQuery),
    enabled: debouncedQuery.length >= 2
  });

  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedQuery]);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  function goTo(result) {
    setIsOpen(false);
    setQuery("");
    navigate(resultPath(result));
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      setIsOpen(false);
      event.target.blur();
      return;
    }
    if (!results || results.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      goTo(results[activeIndex]);
    }
  }

  const showPopover = isOpen && debouncedQuery.length >= 2;

  return (
    <div ref={containerRef} className="relative hidden min-w-0 max-w-xs flex-1 md:block">
      <label>
        <span className="sr-only">Search all projects</span>
        <input
          className="h-8 w-full rounded-lg px-3 text-sm outline-none transition placeholder:font-medium focus:ring-2"
          style={{
            border: "1px solid var(--devdoc-border)",
            backgroundColor: "var(--devdoc-surface-inset)",
            color: "var(--devdoc-text)"
          }}
          type="search"
          placeholder="Search all projects…"
          aria-label="Search all projects"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
      </label>

      {showPopover ? (
        <div
          className="devdoc-scale-in absolute left-0 right-0 z-40 mt-1.5 max-h-96 overflow-y-auto rounded-xl border shadow-lg"
          style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
          role="listbox"
        >
          {isFetching && !results ? (
            <p className="px-4 py-3 text-sm" style={{ color: "var(--devdoc-muted)" }}>Searching…</p>
          ) : results && results.length > 0 ? (
            results.map((result, index) => {
              const meta = TYPE_META[result.type] || { color: "var(--devdoc-muted)", label: "?" };
              const isActive = index === activeIndex;
              return (
                <button
                  key={`${result.type}-${result.id}`}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className="flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors"
                  style={{ backgroundColor: isActive ? "var(--devdoc-surface-hover, var(--devdoc-surface-muted))" : "transparent" }}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => goTo(result)}
                >
                  <span
                    className="mt-0.5 flex h-6 w-9 shrink-0 items-center justify-center rounded-md text-[10px] font-black text-white"
                    style={{ backgroundColor: meta.color }}
                  >
                    {meta.label}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold" style={{ color: "var(--devdoc-text)" }}>
                      {result.code ? `${result.code} — ` : ""}{result.title}
                    </span>
                    <span className="block truncate text-xs" style={{ color: "var(--devdoc-muted)" }}>
                      in {result.projectName}
                      {result.snippet ? ` · ${result.snippet}` : ""}
                    </span>
                  </span>
                </button>
              );
            })
          ) : results ? (
            <p className="px-4 py-3 text-sm" style={{ color: "var(--devdoc-muted)" }}>
              No results for “{debouncedQuery}”
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default GlobalSearch;
