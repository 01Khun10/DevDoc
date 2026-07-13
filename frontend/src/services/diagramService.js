import apiRequest from "./api";

async function getTraceabilityTreePlantUml(projectId) {
  const response = await apiRequest(`/api/projects/${projectId}/diagrams/traceability-tree/plantuml`);
  return response.diagram;
}

async function getUseCasePlantUml(projectId) {
  const response = await apiRequest(`/api/projects/${projectId}/diagrams/use-case/plantuml`);
  return response.diagram;
}

async function getComponentPlantUml(projectId) {
  const response = await apiRequest(`/api/projects/${projectId}/diagrams/component/plantuml`);
  return response.diagram;
}

async function getDiagramGraphData(projectId) {
  const response = await apiRequest(`/api/projects/${projectId}/diagrams/graph-data`);
  return response.graph;
}

export { getTraceabilityTreePlantUml, getUseCasePlantUml, getComponentPlantUml, getDiagramGraphData };
