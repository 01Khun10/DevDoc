import { createContext, useContext, useMemo } from "react";

const ProjectContext = createContext(null);

function ProjectProvider({ projectId, project, children }) {
  const value = useMemo(
    () => ({
      projectId,
      project
    }),
    [project, projectId]
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

function useProject() {
  const context = useContext(ProjectContext);

  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }

  return context;
}

function useOptionalProject() {
  return useContext(ProjectContext);
}

export { ProjectProvider, useProject, useOptionalProject };
