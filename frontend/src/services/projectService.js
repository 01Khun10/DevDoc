import apiRequest from "./api";

async function listProjects() {
  const response = await apiRequest("/api/projects");
  return response.projects || [];
}

async function createProject({ name, description }) {
  const response = await apiRequest("/api/projects", {
    method: "POST",
    body: {
      name,
      description
    }
  });

  return response.project;
}

async function getProject(id) {
  const response = await apiRequest(`/api/projects/${id}`);
  return response.project;
}

async function updateProject(id, values) {
  const response = await apiRequest(`/api/projects/${id}`, {
    method: "PUT",
    body: values
  });

  return response.project;
}

async function getProjectOverview(id) {
  const response = await apiRequest(`/api/projects/${id}/overview`);
  return response.overview;
}

export { listProjects, createProject, getProject, updateProject, getProjectOverview };
