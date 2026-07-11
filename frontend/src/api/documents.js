import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDocumentFromTemplate,
  getDocument,
  getSectionLinkedArtefacts,
  updateDocumentSection
} from "../services/documentService";

export function useDocument(projectId, documentId, options = {}) {
  return useQuery({
    queryKey: ["projects", projectId, "documents", documentId],
    queryFn: () => getDocument(projectId, documentId),
    enabled: Boolean(projectId && documentId),
    ...options
  });
}

export function useSectionLinkedArtefacts(projectId, documentId, sectionId, options = {}) {
  return useQuery({
    queryKey: ["projects", projectId, "documents", documentId, "sections", sectionId, "links"],
    queryFn: () => getSectionLinkedArtefacts(projectId, documentId, sectionId),
    enabled: Boolean(projectId && documentId && sectionId),
    ...options
  });
}

export function useCreateDocumentFromTemplate(projectId, options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => createDocumentFromTemplate(projectId, input),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      options.onSuccess?.(...args);
    }
  });
}

export function useUpdateDocumentSection(projectId, documentId, options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionId, content }) =>
      updateDocumentSection(projectId, documentId, sectionId, content),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "documents", documentId]
      });
      options.onSuccess?.(...args);
    }
  });
}
