import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTestCase,
  deleteTestCase,
  listTestCases,
  updateTestCase
} from "../services/testCaseService";

export function useTestCases(projectId, options = {}) {
  return useQuery({
    queryKey: ["projects", projectId, "test-cases"],
    queryFn: () => listTestCases(projectId),
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
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "test-cases"] });
      options.onSuccess?.(...args);
    }
  });
}

export function useCreateTestCase(projectId, options = {}) {
  return useInvalidatingMutation(projectId, (input) => createTestCase(projectId, input), options);
}

export function useUpdateTestCase(projectId, options = {}) {
  return useInvalidatingMutation(
    projectId,
    ({ testCaseId, ...input }) => updateTestCase(projectId, testCaseId, input),
    options
  );
}

export function useDeleteTestCase(projectId, options = {}) {
  return useInvalidatingMutation(
    projectId,
    (testCaseId) => deleteTestCase(projectId, testCaseId),
    options
  );
}
