import apiRequest from "./api";

async function listUseCases(projectId) {
  const response = await apiRequest(`/api/projects/${encodeURIComponent(projectId)}/use-cases`);

  return response.useCases || [];
}

async function createUseCase(projectId, input) {
  const response = await apiRequest(
    `/api/projects/${encodeURIComponent(projectId)}/use-cases`,
    {
      method: "POST",
      body: input
    }
  );

  return response.useCase;
}

async function getUseCase(projectId, useCaseId) {
  const response = await apiRequest(
    `/api/projects/${encodeURIComponent(projectId)}/use-cases/${encodeURIComponent(useCaseId)}`
  );

  return response.useCase;
}

async function updateUseCase(projectId, useCaseId, input) {
  const response = await apiRequest(
    `/api/projects/${encodeURIComponent(projectId)}/use-cases/${encodeURIComponent(useCaseId)}`,
    {
      method: "PUT",
      body: input
    }
  );

  return response.useCase;
}

export { listUseCases, createUseCase, getUseCase, updateUseCase };
