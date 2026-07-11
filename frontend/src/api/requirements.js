import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRequirement,
  listRequirements,
  updateRequirement
} from "../services/requirementService";

export function useRequirements(projectId, options = {}) {
  return useQuery({
    queryKey: ["projects", projectId, "requirements"],
    queryFn: () => listRequirements(projectId),
    enabled: Boolean(projectId),
    ...options
  });
}

export function useCreateRequirement(projectId, options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => createRequirement(projectId, input),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "requirements"] });
      options.onSuccess?.(...args);
    }
  });
}

export function useUpdateRequirement(projectId, options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requirementId, ...input }) =>
      updateRequirement(projectId, requirementId, input),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "requirements"] });
      options.onSuccess?.(...args);
    }
  });
}
