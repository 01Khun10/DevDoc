import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRequirement,
  createRequirementFromSection,
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

// Inline capture from the document editor: creates the requirement plus its
// described_by link, so both the registry and the matrix need refreshing.
export function useCreateRequirementFromSection(projectId, options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => createRequirementFromSection(projectId, input),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "requirements"] });
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "traceability"] });
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
