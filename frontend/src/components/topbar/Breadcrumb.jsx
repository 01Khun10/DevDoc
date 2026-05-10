import { useLocation } from "react-router-dom";

function getBreadcrumbLabel(pathname) {
  const segments = pathname.split("/").filter(Boolean);

  if (pathname === "/dashboard") {
    return "Dashboard";
  }

  if (pathname === "/profile") {
    return "Profile";
  }

  if (pathname === "/settings") {
    return "Settings";
  }

  if (pathname === "/help") {
    return "Help";
  }

  if (pathname === "/docs") {
    return "Docs";
  }

  if (pathname === "/about") {
    return "About";
  }

  if (segments[0] === "projects" && segments[2] === "documents" && segments[4]) {
    return "Document Editor";
  }

  if (segments[0] === "projects" && segments[2] === "templates") {
    return "Templates";
  }

  if (segments[0] === "projects" && segments[2] === "requirements") {
    return "Requirements";
  }

  if (segments[0] === "projects" && segments[2] === "traceability") {
    return "Traceability";
  }

  if (segments[0] === "projects" && segments[2] === "validation") {
    return "Validation";
  }

  if (segments[0] === "projects" && segments[1]) {
    return "Project Workspace";
  }

  return "DevDoc";
}

function Breadcrumb() {
  const location = useLocation();
  const label = getBreadcrumbLabel(location.pathname);

  return (
    <div className="flex min-w-0 items-center gap-2 text-sm text-slate-500">
      <span className="hidden sm:inline">Workspace</span>
      <span className="hidden text-slate-300 sm:inline">/</span>
      <span className="truncate font-semibold text-slate-700">{label}</span>
    </div>
  );
}

export default Breadcrumb;
