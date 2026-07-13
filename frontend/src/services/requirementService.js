import apiRequest from "./api";

async function listRequirements(projectId) {
  const response = await apiRequest(
    `/api/projects/${encodeURIComponent(projectId)}/requirements`
  );

  return response.requirements || [];
}

async function createRequirement(projectId, input) {
  const response = await apiRequest(
    `/api/projects/${encodeURIComponent(projectId)}/requirements`,
    {
      method: "POST",
      body: input
    }
  );

  return response.requirement;
}

async function createRequirementFromSection(projectId, input) {
  const response = await apiRequest(
    `/api/projects/${encodeURIComponent(projectId)}/requirements/from-section`,
    {
      method: "POST",
      body: input
    }
  );

  return response.requirement;
}

async function getRequirement(projectId, requirementId) {
  const response = await apiRequest(
    `/api/projects/${encodeURIComponent(projectId)}/requirements/${encodeURIComponent(
      requirementId
    )}`
  );

  return response.requirement;
}

async function updateRequirement(projectId, requirementId, input) {
  const response = await apiRequest(
    `/api/projects/${encodeURIComponent(projectId)}/requirements/${encodeURIComponent(
      requirementId
    )}`,
    {
      method: "PUT",
      body: input
    }
  );

  return response.requirement;
}

async function deleteRequirement(projectId, requirementId) {
  return apiRequest(
    `/api/projects/${encodeURIComponent(projectId)}/requirements/${encodeURIComponent(
      requirementId
    )}`,
    { method: "DELETE" }
  );
}

export {
  listRequirements,
  createRequirement,
  createRequirementFromSection,
  getRequirement,
  updateRequirement,
  deleteRequirement
};
