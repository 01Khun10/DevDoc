import apiRequest from "./api";

async function createDocumentFromTemplate(projectId, { templateCode, title }) {
  const body = { templateCode };

  if (title !== undefined) {
    body.title = title;
  }

  const response = await apiRequest(
    `/api/projects/${encodeURIComponent(projectId)}/documents/from-template`,
    {
      method: "POST",
      body
    }
  );

  return response.document;
}

export { createDocumentFromTemplate };
