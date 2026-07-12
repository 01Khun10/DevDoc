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

async function getTraceabilitySuggestions(projectId) {
  const response = await apiRequest(
    `/api/projects/${encodeURIComponent(projectId)}/traceability/suggestions`
  );

  return response.suggestions || [];
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

async function verifyTraceabilityLink(projectId, linkId) {
  const response = await apiRequest(
    `/api/projects/${encodeURIComponent(projectId)}/traceability/${encodeURIComponent(linkId)}/verify`,
    {
      method: "PATCH"
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
  getTraceabilitySuggestions,
  createTraceabilityLink,
  verifyTraceabilityLink,
  deleteTraceabilityLink
};
