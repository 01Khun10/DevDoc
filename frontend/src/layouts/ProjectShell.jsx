import { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import ProjectErrorState from "../components/project/ProjectErrorState";
import ProjectSidebar from "../components/project/ProjectSidebar";
import { ProjectProvider } from "../context/ProjectContext";
import useAuth from "../hooks/useAuth";
import { getProject } from "../services/projectService";

function isDocumentEditorRoute(pathname) {
  const segments = pathname.split("/").filter(Boolean);
  return segments[0] === "projects" && segments[2] === "documents" && Boolean(segments[3]);
}

function ProjectShell() {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const projectId = params.id || params.projectId;
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const isEditorRoute = useMemo(() => isDocumentEditorRoute(location.pathname), [location.pathname]);

  const loadProject = useCallback(async () => {
    if (!projectId) {
      setLoadError("missing-project");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError("");

    try {
      const loadedProject = await getProject(projectId);
      setProject(loadedProject);
    } catch (error) {
      if (error.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      setProject(null);
      setLoadError("load-error");
    } finally {
      setIsLoading(false);
    }
  }, [logout, navigate, projectId]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  if (isLoading) {
    return (
      <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-slate-50 px-6 text-slate-900">
        <p className="text-sm font-medium text-slate-600">Loading project...</p>
      </main>
    );
  }

  if (loadError || !project) {
    return <ProjectErrorState onRetry={loadProject} />;
  }

  return (
    <ProjectProvider projectId={projectId} project={project}>
      {isEditorRoute ? (
        <Outlet />
      ) : (
        <div className="min-h-[calc(100vh-73px)] bg-slate-50 lg:flex">
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
