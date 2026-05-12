import { useLocation } from "react-router-dom";

function getPlaceholder(pathname) {
  if (pathname === "/dashboard") {
    return "Search projects…";
  }

  if (pathname.startsWith("/projects/")) {
    return "Search this project…";
  }

  return "Search DevDoc…";
}

function SearchPlaceholder() {
  const location = useLocation();

  return (
    <label className="hidden min-w-0 max-w-xs flex-1 md:block">
      <span className="sr-only">Search</span>
      <input
        className="h-8 w-full rounded-lg px-3 text-sm outline-none transition placeholder:font-medium disabled:cursor-not-allowed"
        style={{
          border: "1px solid var(--devdoc-border)",
          backgroundColor: "var(--devdoc-surface-inset)",
          color: "var(--devdoc-muted)",
        }}
        type="search"
        placeholder={getPlaceholder(location.pathname)}
        aria-label="Search placeholder"
        disabled
      />
    </label>
  );
}

export default SearchPlaceholder;
