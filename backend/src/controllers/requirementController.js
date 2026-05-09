const {
  validateCreateRequirementInput,
  validateUpdateRequirementInput
} = require("../validators/requirementValidator");
const {
  PROJECT_NOT_FOUND,
  REQUIREMENT_NOT_FOUND,
  createRequirement,
  getRequirements,
  getRequirementById,
  updateRequirement
} = require("../services/requirementService");

function sendError(res, statusCode, message, fields) {
  const error = { message };

  if (fields) {
    error.fields = fields;
  }

  return res.status(statusCode).json({ error });
}

async function list(req, res) {
  try {
    const requirements = await getRequirements(req.user.id, req.params.projectId);
    return res.status(200).json({ requirements });
  } catch (error) {
    if (error.code === PROJECT_NOT_FOUND) {
      return sendError(res, 404, "Project not found");
    }

    return sendError(res, 500, "Unexpected server error");
  }
}

async function create(req, res) {
  const validation = validateCreateRequirementInput(req.body);

  if (!validation.isValid) {
    return sendError(res, 400, "Validation failed", validation.fields);
  }

  try {
    const requirement = await createRequirement(
      req.user.id,
      req.params.projectId,
      validation.values
    );

    return res.status(201).json({ requirement });
  } catch (error) {
    if (error.code === PROJECT_NOT_FOUND) {
      return sendError(res, 404, "Project not found");
    }

    return sendError(res, 500, "Unexpected server error");
  }
}

async function get(req, res) {
  try {
    const requirement = await getRequirementById(
      req.user.id,
      req.params.projectId,
      req.params.requirementId
    );

    return res.status(200).json({ requirement });
  } catch (error) {
    if (error.code === REQUIREMENT_NOT_FOUND) {
      return sendError(res, 404, "Requirement not found");
    }

    return sendError(res, 500, "Unexpected server error");
  }
}

async function update(req, res) {
  const validation = validateUpdateRequirementInput(req.body);

  if (!validation.isValid) {
    return sendError(res, 400, "Validation failed", validation.fields);
  }

  try {
    const requirement = await updateRequirement(
      req.user.id,
      req.params.projectId,
      req.params.requirementId,
      validation.values
    );

    return res.status(200).json({ requirement });
  } catch (error) {
    if (error.code === REQUIREMENT_NOT_FOUND) {
      return sendError(res, 404, "Requirement not found");
    }

    return sendError(res, 500, "Unexpected server error");
  }
}

module.exports = {
  list,
  create,
  get,
  update
};
