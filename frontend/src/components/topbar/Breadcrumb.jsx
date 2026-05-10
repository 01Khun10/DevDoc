import { useLocation } from "react-router-dom";
import { useOptionalProject } from "../../context/ProjectContext";

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

  if (segments[0] === "projects" && segments[2] === "documents") {
    return "Documents";
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

  if (segments[0] === "projects" && segments[2] === "diagrams") {
    return "Diagrams";
  }

  if (segments[0] === "projects" && segments[2] === "versions") {
    return "Versions";
  }

  if (segments[0] === "projects" && segments[2] === "analytics") {
    return "Analytics";
  }

  if (segments[0] === "projects" && segments[2] === "settings") {
    return "Project Settings";
  }

  if (segments[0] === "projects" && segments[1]) {
    return "Project Workspace";
  }

  return "DevDoc";
}

function Breadcrumb() {
  const location = useLocation();
  const label = getBreadcrumbLabel(location.pathname);
  const projectContext = useOptionalProject();
  const projectName = projectContext?.project?.name || "";
  const isProjectRoute = location.pathname.startsWith("/projects/");

  return (
    <div className="flex min-w-0 items-center gap-2 text-sm text-[var(--devdoc-muted)]">
      <span className="hidden sm:inline">{isProjectRoute ? projectName || "Project" : "Workspace"}</span>
      <span className="hidden text-[var(--devdoc-subtle)] sm:inline">/</span>
      <span className="truncate font-semibold text-[var(--devdoc-text)]">{label}</span>
    </div>
  );
}

export default Breadcrumb;
