import apiRequest from "./api";

async function listTraceabilityLinks(projectId) {
  const response = await apiRequest(
    `/api/projects/${encodeURIComponent(projectId)}/traceability`
  );

  return response.traceabilityLinks || [];
}

async function getTraceabilityOptions(projectId) {
  return apiRequest(`/api/projects/${encodeURIComponent(projectId)}/traceability/options`);
}

async function createTraceabilityLink(projectId, input) {
  const response = await apiRequest(
    `/api/projects/${encodeURIComponent(projectId)}/traceability`,
    {
      method: "POST",
      body: input
    }
  );

  return response.traceabilityLink;
}

async function deleteTraceabilityLink(projectId, linkId) {
  return apiRequest(
    `/api/projects/${encodeURIComponent(projectId)}/traceability/${encodeURIComponent(linkId)}`,
    {
      method: "DELETE"
    }
  );
}

export {
  listTraceabilityLinks,
  getTraceabilityOptions,
  createTraceabilityLink,
  deleteTraceabilityLink
};
