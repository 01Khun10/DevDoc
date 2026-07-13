const PRIORITY_RANK = { HIGH: 0, MEDIUM: 1, LOW: 2 };

const SORTS = {
  newest: { label: "Newest first", fn: (a, b) => new Date(b.createdAt) - new Date(a.createdAt) },
  oldest: { label: "Oldest first", fn: (a, b) => new Date(a.createdAt) - new Date(b.createdAt) },
  code: { label: "Code A→Z", fn: (a, b) => (a.code || "").localeCompare(b.code || "") },
  priority: {
    label: "Priority (HIGH first)",
    fn: (a, b) => (PRIORITY_RANK[a.priority] ?? 3) - (PRIORITY_RANK[b.priority] ?? 3)
  }
};

export function sortAndSearch(items, { sort = "newest", search = "", withPriority = false } = {}) {
  const query = search.trim().toLowerCase();
  const filtered = query
    ? items.filter(
        (item) =>
          (item.code || "").toLowerCase().includes(query) ||
          (item.title || "").toLowerCase().includes(query)
      )
    : items;
  const sorter = SORTS[sort] ?? SORTS.newest;
  void withPriority;
  return [...filtered].sort(sorter.fn);
}

export function RegistryControls({ sort, onSortChange, search, onSearchChange, withPriority = false }) {
  const keys = withPriority ? Object.keys(SORTS) : Object.keys(SORTS).filter((k) => k !== "priority");
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        className="devdoc-input h-9 w-44 text-sm"
        type="search"
        placeholder="Search code or title"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      <select
        className="devdoc-select h-9 text-sm"
        value={sort}
        onChange={(event) => onSortChange(event.target.value)}
        aria-label="Sort"
      >
        {keys.map((key) => (
          <option key={key} value={key}>
            {SORTS[key].label}
          </option>
        ))}
      </select>
    </div>
  );
}
