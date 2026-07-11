import { useQuery } from "@tanstack/react-query";
import { getTraceabilityTreePlantUml } from "../services/diagramService";

export function useTraceabilityTreePlantUml(projectId, options = {}) {
  return useQuery({
    queryKey: ["projects", projectId, "diagrams", "traceability-tree"],
    queryFn: () => getTraceabilityTreePlantUml(projectId),
    enabled: Boolean(projectId),
    ...options
  });
}
