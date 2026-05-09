import apiRequest from "./api";

async function listProfiles() {
  const response = await apiRequest("/api/templates/profiles");
  return response.profiles || [];
}

async function listTemplatesByProfile(profileCode) {
  return apiRequest(`/api/templates/profiles/${encodeURIComponent(profileCode)}/templates`);
}

async function getTemplateSections(templateCode) {
  return apiRequest(`/api/templates/${encodeURIComponent(templateCode)}/sections`);
}

export { listProfiles, listTemplatesByProfile, getTemplateSections };
