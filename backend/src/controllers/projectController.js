const {
  validateCreateProjectInput,
  validateUpdateProjectInput
} = require("../validators/projectValidator");
const {
  PROJECT_NOT_FOUND,
  PROFILE_NOT_FOUND,
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  getProjectOverview: getProjectOverviewService
} = require("../services/projectService");

function sendError(res, statusCode, message, fields) {
  const error = { message };
  if (fields) {
    error.fields = fields;
  }
  return res.status(statusCode).json({ error });
}

async function create(req, res) {
  const validation = validateCreateProjectInput(req.body);

  if (!validation.isValid) {
    return sendError(res, 400, "Validation failed", validation.fields);
  }

  try {
    const project = await createProject(req.user.id, validation.values);
    return res.status(201).json({ project });
  } catch (error) {
    if (error.code === PROFILE_NOT_FOUND) {
      return sendError(res, 400, "Validation failed", { profileId: error.message });
    }
    return sendError(res, 500, "Unexpected server error");
  }
}

async function list(req, res) {
  try {
    const projects = await getProjects(req.user.id);
    return res.status(200).json({ projects });
  } catch (error) {
    return sendError(res, 500, "Unexpected server error");
  }
}

async function get(req, res) {
  try {
    const project = await getProjectById(req.user.id, req.params.id);
    return res.status(200).json({ project });
  } catch (error) {
    if (error.code === PROJECT_NOT_FOUND) {
      return sendError(res, 404, "Project not found");
    }
    return sendError(res, 500, "Unexpected server error");
  }
}

async function update(req, res) {
  const validation = validateUpdateProjectInput(req.body);

  if (!validation.isValid) {
    return sendError(res, 400, "Validation failed", validation.fields);
  }

  try {
    const project = await updateProject(req.user.id, req.params.id, validation.values);
    return res.status(200).json({ project });
  } catch (error) {
    if (error.code === PROJECT_NOT_FOUND) {
      return sendError(res, 404, "Project not found");
    }
    if (error.code === PROFILE_NOT_FOUND) {
      return sendError(res, 400, "Validation failed", { profileId: error.message });
    }
    return sendError(res, 500, "Unexpected server error");
  }
}

async function getProjectOverview(req, res) {
  try {
    const overview = await getProjectOverviewService(req.user.id, req.params.id);
    return res.status(200).json({ overview });
  } catch (error) {
    if (error.code === PROJECT_NOT_FOUND) {
      return sendError(res, 404, "Project not found");
    }
    return sendError(res, 500, "Unexpected server error");
  }
}

module.exports = {
  create,
  list,
  get,
  update,
  getProjectOverview
};
