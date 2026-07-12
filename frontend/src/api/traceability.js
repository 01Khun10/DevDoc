import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTraceabilityLink,
  deleteTraceabilityLink,
  getTraceabilityOptions,
  getTraceabilitySuggestions,
  listTraceabilityLinks,
  verifyTraceabilityLink
} from "../services/traceabilityService";

const linksKey = (projectId) => ["projects", projectId, "traceability"];

export function useTraceabilityLinks(projectId, options = {}) {
  return useQuery({
    queryKey: linksKey(projectId),
    queryFn: () => listTraceabilityLinks(projectId),
    enabled: Boolean(projectId),
    ...options
  });
}

export function useTraceabilityOptions(projectId, options = {}) {
  return useQuery({
    queryKey: ["projects", projectId, "traceability", "options"],
    queryFn: () => getTraceabilityOptions(projectId),
    enabled: Boolean(projectId),
    ...options
  });
}

export function useTraceabilitySuggestions(projectId, options = {}) {
  return useQuery({
    queryKey: ["projects", projectId, "traceability", "suggestions"],
    queryFn: () => getTraceabilitySuggestions(projectId),
    enabled: Boolean(projectId),
    ...options
  });
}

// Optimistic: inserts a temp link immediately, rolls back on error.
export function useCreateTraceabilityLink(projectId, options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => createTraceabilityLink(projectId, input),
    ...options,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: linksKey(projectId), exact: true });
      const previousLinks = queryClient.getQueryData(linksKey(projectId));
      const optimisticLink = {
        id: `optimistic-${Date.now()}`,
        projectId,
        createdAt: new Date().toISOString(),
        lastVerifiedAt: new Date().toISOString(),
        ...input
      };
      queryClient.setQueryData(linksKey(projectId), (links = []) => [optimisticLink, ...links]);
      const externalContext = await options.onMutate?.(input);
      return { previousLinks, externalContext };
    },
    onError: (error, input, context) => {
      queryClient.setQueryData(linksKey(projectId), context.previousLinks);
      options.onError?.(error, input, context?.externalContext);
    },
    onSuccess: (data, input, context) => {
      options.onSuccess?.(data, input, context?.externalContext);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: linksKey(projectId), exact: true });
      queryClient.invalidateQueries({ queryKey: [...linksKey(projectId), "suggestions"], exact: true });
    }
  });
}

// Optimistic: removes the link immediately, rolls back on error.
export function useDeleteTraceabilityLink(projectId, options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (linkId) => deleteTraceabilityLink(projectId, linkId),
    ...options,
    onMutate: async (linkId) => {
      await queryClient.cancelQueries({ queryKey: linksKey(projectId), exact: true });
      const previousLinks = queryClient.getQueryData(linksKey(projectId));
      queryClient.setQueryData(linksKey(projectId), (links = []) =>
        links.filter((link) => link.id !== linkId)
      );
      const externalContext = await options.onMutate?.(linkId);
      return { previousLinks, externalContext };
    },
    onError: (error, linkId, context) => {
      queryClient.setQueryData(linksKey(projectId), context.previousLinks);
      options.onError?.(error, linkId, context?.externalContext);
    },
    onSuccess: (data, linkId, context) => {
      options.onSuccess?.(data, linkId, context?.externalContext);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: linksKey(projectId), exact: true });
      queryClient.invalidateQueries({ queryKey: [...linksKey(projectId), "suggestions"], exact: true });
    }
  });
}

export function useVerifyTraceabilityLink(projectId, options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (linkId) => verifyTraceabilityLink(projectId, linkId),
    ...options,
    onSuccess: (verifiedLink, ...args) => {
      queryClient.setQueryData(linksKey(projectId), (links = []) =>
        links.map((link) => (link.id === verifiedLink.id ? verifiedLink : link))
      );
      options.onSuccess?.(verifiedLink, ...args);
    }
  });
}
