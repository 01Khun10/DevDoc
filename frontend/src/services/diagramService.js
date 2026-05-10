import apiRequest from "./api";

async function getTraceabilityTreePlantUml(projectId) {
  const response = await apiRequest(`/api/projects/${projectId}/diagrams/traceability-tree/plantuml`);
  return response.diagram;
}

export { getTraceabilityTreePlantUml };
