import apiRequest from "./api";

async function listDesignElements(projectId) {
  const response = await apiRequest(
    `/api/projects/${encodeURIComponent(projectId)}/design-elements`
  );

  return response.designElements || [];
}

async function createDesignElement(projectId, input) {
  const response = await apiRequest(
    `/api/projects/${encodeURIComponent(projectId)}/design-elements`,
    {
      method: "POST",
      body: input
    }
  );

  return response.designElement;
}

async function updateDesignElement(projectId, designElementId, input) {
  const response = await apiRequest(
    `/api/projects/${encodeURIComponent(projectId)}/design-elements/${encodeURIComponent(
      designElementId
    )}`,
    {
      method: "PUT",
      body: input
    }
  );

  return response.designElement;
}

async function deleteDesignElement(projectId, designElementId) {
  return apiRequest(
    `/api/projects/${encodeURIComponent(projectId)}/design-elements/${encodeURIComponent(
      designElementId
    )}`,
    {
      method: "DELETE"
    }
  );
}

export { listDesignElements, createDesignElement, updateDesignElement, deleteDesignElement };
