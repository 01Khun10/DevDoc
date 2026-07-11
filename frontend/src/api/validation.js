import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getValidationRun,
  listValidationRuns,
  runValidation
} from "../services/validationService";

export function useValidationRuns(projectId, options = {}) {
  return useQuery({
    queryKey: ["projects", projectId, "validation-runs"],
    queryFn: () => listValidationRuns(projectId),
    enabled: Boolean(projectId),
    ...options
  });
}

export function useValidationRun(projectId, runId, options = {}) {
  return useQuery({
    queryKey: ["projects", projectId, "validation-runs", runId],
    queryFn: () => getValidationRun(projectId, runId),
    enabled: Boolean(projectId && runId),
    ...options
  });
}

export function useRunValidation(projectId, options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => runValidation(projectId),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "validation-runs"] });
      options.onSuccess?.(...args);
    }
  });
}
