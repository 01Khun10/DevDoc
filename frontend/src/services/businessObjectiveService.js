import apiRequest from "./api";

async function listBusinessObjectives(projectId) {
  const response = await apiRequest(
    `/api/projects/${encodeURIComponent(projectId)}/business-objectives`
  );

  return response.businessObjectives || [];
}

async function createBusinessObjective(projectId, input) {
  const response = await apiRequest(
    `/api/projects/${encodeURIComponent(projectId)}/business-objectives`,
    {
      method: "POST",
      body: input
    }
  );

  return response.businessObjective;
}

async function updateBusinessObjective(projectId, objectiveId, input) {
  const response = await apiRequest(
    `/api/projects/${encodeURIComponent(projectId)}/business-objectives/${encodeURIComponent(
      objectiveId
    )}`,
    {
      method: "PATCH",
      body: input
    }
  );

  return response.businessObjective;
}

async function deleteBusinessObjective(projectId, objectiveId) {
  return apiRequest(
    `/api/projects/${encodeURIComponent(projectId)}/business-objectives/${encodeURIComponent(
      objectiveId
    )}`,
    {
      method: "DELETE"
    }
  );
}

export {
  listBusinessObjectives,
  createBusinessObjective,
  updateBusinessObjective,
  deleteBusinessObjective
};
