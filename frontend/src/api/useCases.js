import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUseCase, listUseCases, updateUseCase } from "../services/useCaseService";

export function useUseCases(projectId, options = {}) {
  return useQuery({
    queryKey: ["projects", projectId, "use-cases"],
    queryFn: () => listUseCases(projectId),
    enabled: Boolean(projectId),
    ...options
  });
}

export function useCreateUseCase(projectId, options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => createUseCase(projectId, input),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "use-cases"] });
      options.onSuccess?.(...args);
    }
  });
}

export function useUpdateUseCase(projectId, options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ useCaseId, ...input }) => updateUseCase(projectId, useCaseId, input),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "use-cases"] });
      options.onSuccess?.(...args);
    }
  });
}
