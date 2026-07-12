import { useMemo } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";
import CommandPalette from "../components/CommandPalette";
import LoadingSpinner from "../components/LoadingSpinner";
import ProjectErrorState from "../components/project/ProjectErrorState";
import ProjectSidebar from "../components/project/ProjectSidebar";
import { ProjectProvider } from "../context/ProjectContext";
import { useProject as useProjectQuery } from "../api/projects";
import useAuthGuard from "../api/useAuthGuard";

function isDocumentEditorRoute(pathname) {
  const segments = pathname.split("/").filter(Boolean);
  return segments[0] === "projects" && segments[2] === "documents" && Boolean(segments[3]);
}

function ProjectShell() {
  const params = useParams();
  const location = useLocation();
  const projectId = params.id || params.projectId;
  const { data: project, isLoading, error, refetch } = useProjectQuery(projectId);
  useAuthGuard(error);
  const isEditorRoute = useMemo(() => isDocumentEditorRoute(location.pathname), [location.pathname]);

  if (isLoading) {
    return <LoadingSpinner fullScreen label="Loading project..." />;
  }

  if (error || !project) {
    return <ProjectErrorState onRetry={refetch} />;
  }

  return (
    <ProjectProvider projectId={projectId} project={project}>
      <CommandPalette projectId={projectId} />
      {isEditorRoute ? (
        <Outlet />
      ) : (
        <div className="min-h-[calc(100vh-52px)] bg-[var(--devdoc-bg)] lg:flex">
          <ProjectSidebar />
          <div className="min-w-0 flex-1">
            <Outlet />
          </div>
        </div>
      )}
    </ProjectProvider>
  );
}

export default ProjectShell;
