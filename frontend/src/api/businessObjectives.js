import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBusinessObjective,
  deleteBusinessObjective,
  listBusinessObjectives,
  updateBusinessObjective
} from "../services/businessObjectiveService";

export function useBusinessObjectives(projectId, options = {}) {
  return useQuery({
    queryKey: ["projects", projectId, "businessObjectives"],
    queryFn: () => listBusinessObjectives(projectId),
    enabled: Boolean(projectId),
    ...options
  });
}

function useInvalidatingMutation(projectId, mutationFn, options) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "businessObjectives"] });
      // BOs also appear in traceability options and the graph.
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "traceability"] });
      options.onSuccess?.(...args);
    }
  });
}

export function useCreateBusinessObjective(projectId, options = {}) {
  return useInvalidatingMutation(
    projectId,
    (input) => createBusinessObjective(projectId, input),
    options
  );
}

export function useUpdateBusinessObjective(projectId, options = {}) {
  return useInvalidatingMutation(
    projectId,
    ({ objectiveId, ...input }) => updateBusinessObjective(projectId, objectiveId, input),
    options
  );
}

export function useDeleteBusinessObjective(projectId, options = {}) {
  return useInvalidatingMutation(
    projectId,
    (objectiveId) => deleteBusinessObjective(projectId, objectiveId),
    options
  );
}
