import apiRequest from "./api";

async function runValidation(projectId) {
  const response = await apiRequest(
    `/api/projects/${encodeURIComponent(projectId)}/validation/run`,
    {
      method: "POST"
    }
  );

  return response.validationRun;
}

async function listValidationRuns(projectId) {
  const response = await apiRequest(
    `/api/projects/${encodeURIComponent(projectId)}/validation/runs`
  );

  return response.validationRuns || [];
}

async function getValidationRun(projectId, runId) {
  const response = await apiRequest(
    `/api/projects/${encodeURIComponent(projectId)}/validation/runs/${encodeURIComponent(runId)}`
  );

  return response.validationRun;
}

export { runValidation, listValidationRuns, getValidationRun };
