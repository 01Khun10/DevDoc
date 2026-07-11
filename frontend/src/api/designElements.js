import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDesignElement,
  deleteDesignElement,
  listDesignElements,
  updateDesignElement
} from "../services/designElementService";

export function useDesignElements(projectId, options = {}) {
  return useQuery({
    queryKey: ["projects", projectId, "design-elements"],
    queryFn: () => listDesignElements(projectId),
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
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "design-elements"] });
      options.onSuccess?.(...args);
    }
  });
}

export function useCreateDesignElement(projectId, options = {}) {
  return useInvalidatingMutation(projectId, (input) => createDesignElement(projectId, input), options);
}

export function useUpdateDesignElement(projectId, options = {}) {
  return useInvalidatingMutation(
    projectId,
    ({ designElementId, ...input }) => updateDesignElement(projectId, designElementId, input),
    options
  );
}

export function useDeleteDesignElement(projectId, options = {}) {
  return useInvalidatingMutation(
    projectId,
    (designElementId) => deleteDesignElement(projectId, designElementId),
    options
  );
}
