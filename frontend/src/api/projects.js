import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProject,
  getProject,
  getProjectOverview,
  listProjects,
  updateProject,
  deleteProject,
  createShareLink
} from "../services/projectService";

export function useProjects(options = {}) {
  return useQuery({ queryKey: ["projects"], queryFn: listProjects, ...options });
}

export function useProject(projectId, options = {}) {
  return useQuery({
    queryKey: ["projects", projectId],
    queryFn: () => getProject(projectId),
    enabled: Boolean(projectId),
    ...options
  });
}

export function useProjectOverview(projectId, options = {}) {
  return useQuery({
    queryKey: ["projects", projectId, "overview"],
    queryFn: () => getProjectOverview(projectId),
    enabled: Boolean(projectId),
    ...options
  });
}

export function useCreateProject(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProject,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      options.onSuccess?.(...args);
    }
  });
}

export function useUpdateProject(projectId, options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values) => updateProject(projectId, values),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      options.onSuccess?.(...args);
    }
  });
}

export function useDeleteProject(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId) => deleteProject(projectId),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      options.onSuccess?.(...args);
    }
  });
}

export function useCreateShareLink(projectId, options = {}) {
  return useMutation({
    mutationFn: () => createShareLink(projectId),
    ...options
  });
}
