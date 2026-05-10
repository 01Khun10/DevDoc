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

async function getDocument(projectId, documentId) {
  const response = await apiRequest(
    `/api/projects/${encodeURIComponent(projectId)}/documents/${encodeURIComponent(documentId)}`
  );

  return response.document;
}

async function updateDocumentSection(projectId, documentId, sectionId, content) {
  return apiRequest(
    `/api/projects/${encodeURIComponent(projectId)}/documents/${encodeURIComponent(
      documentId
    )}/sections/${encodeURIComponent(sectionId)}`,
    {
      method: "PUT",
      body: { content }
    }
  );
}

async function getSectionLinkedArtefacts(projectId, documentId, sectionId) {
  const response = await apiRequest(
    `/api/projects/${encodeURIComponent(projectId)}/documents/${encodeURIComponent(documentId)}/sections/${encodeURIComponent(sectionId)}/linked-artefacts`
  );

  return response.linkedArtefacts;
}

export { createDocumentFromTemplate, getDocument, updateDocumentSection, getSectionLinkedArtefacts };
