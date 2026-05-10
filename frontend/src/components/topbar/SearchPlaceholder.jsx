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
        className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 outline-none transition placeholder:text-slate-400 focus:border-teal-300 focus:bg-white focus:ring-2 focus:ring-teal-100"
        type="search"
        placeholder={getPlaceholder(location.pathname)}
        aria-label="Search placeholder"
        disabled
      />
    </label>
  );
}

export default SearchPlaceholder;
