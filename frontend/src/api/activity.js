import { useQuery } from "@tanstack/react-query";
import apiRequest from "../services/api";

async function listActivity(projectId, limit = 50) {
  const response = await apiRequest(
    `/api/projects/${encodeURIComponent(projectId)}/activity?limit=${limit}`
  );

  return response.activities || [];
}

export function useActivityLog(projectId, options = {}) {
  return useQuery({
    queryKey: ["projects", projectId, "activity"],
    queryFn: () => listActivity(projectId),
    enabled: Boolean(projectId),
    // The feed lives on the workspace page; refetching on every mount keeps it
    // current after mutations made on other pages without cross-file invalidation.
    refetchOnMount: "always",
    ...options
  });
}
