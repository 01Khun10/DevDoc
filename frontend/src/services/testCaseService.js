import apiRequest from "./api";

async function listTestCases(projectId) {
  const response = await apiRequest(
    `/api/projects/${encodeURIComponent(projectId)}/test-cases`
  );

  return response.testCases || [];
}

async function createTestCase(projectId, input) {
  const response = await apiRequest(
    `/api/projects/${encodeURIComponent(projectId)}/test-cases`,
    {
      method: "POST",
      body: input
    }
  );

  return response.testCase;
}

async function updateTestCase(projectId, testCaseId, input) {
  const response = await apiRequest(
    `/api/projects/${encodeURIComponent(projectId)}/test-cases/${encodeURIComponent(
      testCaseId
    )}`,
    {
      method: "PUT",
      body: input
    }
  );

  return response.testCase;
}

async function deleteTestCase(projectId, testCaseId) {
  return apiRequest(
    `/api/projects/${encodeURIComponent(projectId)}/test-cases/${encodeURIComponent(
      testCaseId
    )}`,
    {
      method: "DELETE"
    }
  );
}

export { listTestCases, createTestCase, updateTestCase, deleteTestCase };
