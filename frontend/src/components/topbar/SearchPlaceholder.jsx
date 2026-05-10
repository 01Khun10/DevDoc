import { useLocation } from "react-router-dom";

function getPlaceholder(pathname) {
  if (pathname === "/dashboard") {
    return "Search projects...";
  }

  if (pathname.startsWith("/projects/")) {
    return "Search this project...";
  }

  return "Search DevDoc...";
}

function SearchPlaceholder() {
  const location = useLocation();

  return (
    <label className="hidden min-w-0 flex-1 md:block">
      <span className="sr-only">Search</span>
      <input
        className="h-9 w-full rounded-full border border-[var(--devdoc-border)] bg-[var(--devdoc-surface)] px-4 text-sm text-[var(--devdoc-muted)] shadow-sm outline-none transition placeholder:text-[var(--devdoc-subtle)] disabled:cursor-not-allowed"
        type="search"
        placeholder={getPlaceholder(location.pathname)}
        aria-label="Search placeholder"
        disabled
      />
    </label>
  );
}

export default SearchPlaceholder;
