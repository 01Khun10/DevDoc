const {
  validateCreateBusinessObjectiveInput,
  validateUpdateBusinessObjectiveInput
} = require("../validators/businessObjectiveValidator");
const {
  PROJECT_NOT_FOUND,
  BUSINESS_OBJECTIVE_NOT_FOUND,
  listBusinessObjectives,
  createBusinessObjective,
  getBusinessObjectiveById,
  updateBusinessObjective,
  deleteBusinessObjective
} = require("../services/businessObjectiveService");
const { sendError, sendUnexpectedError } = require("../utils/httpErrors");

async function list(req, res) {
  try {
    const businessObjectives = await listBusinessObjectives(
      req.user.id,
      req.params.projectId
    );
    return res.status(200).json({ businessObjectives });
  } catch (error) {
    if (error.code === PROJECT_NOT_FOUND) {
      return sendError(res, 404, "Project not found");
    }

    return sendUnexpectedError(res, error, "businessObjectiveController.list");
  }
}

async function create(req, res) {
  const validation = validateCreateBusinessObjectiveInput(req.body);

  if (!validation.isValid) {
    return sendError(res, 400, "Validation failed", validation.fields);
  }

  try {
    const businessObjective = await createBusinessObjective(
      req.user.id,
      req.params.projectId,
      validation.values
    );

    return res.status(201).json({ businessObjective });
  } catch (error) {
    if (error.code === PROJECT_NOT_FOUND) {
      return sendError(res, 404, "Project not found");
    }

    return sendUnexpectedError(res, error, "businessObjectiveController.create");
  }
}

async function get(req, res) {
  try {
    const businessObjective = await getBusinessObjectiveById(
      req.user.id,
      req.params.projectId,
      req.params.objectiveId
    );

    return res.status(200).json({ businessObjective });
  } catch (error) {
    if (error.code === BUSINESS_OBJECTIVE_NOT_FOUND) {
      return sendError(res, 404, "Business objective not found");
    }

    return sendUnexpectedError(res, error, "businessObjectiveController.get");
  }
}

async function update(req, res) {
  const validation = validateUpdateBusinessObjectiveInput(req.body);

  if (!validation.isValid) {
    return sendError(res, 400, "Validation failed", validation.fields);
  }

  try {
    const businessObjective = await updateBusinessObjective(
      req.user.id,
      req.params.projectId,
      req.params.objectiveId,
      validation.values
    );

    return res.status(200).json({ businessObjective });
  } catch (error) {
    if (error.code === BUSINESS_OBJECTIVE_NOT_FOUND) {
      return sendError(res, 404, "Business objective not found");
    }

    return sendUnexpectedError(res, error, "businessObjectiveController.update");
  }
}

async function remove(req, res) {
  try {
    const result = await deleteBusinessObjective(
      req.user.id,
      req.params.projectId,
      req.params.objectiveId
    );

    return res.status(200).json(result);
  } catch (error) {
    if (error.code === BUSINESS_OBJECTIVE_NOT_FOUND) {
      return sendError(res, 404, "Business objective not found");
    }

    return sendUnexpectedError(res, error, "businessObjectiveController.remove");
  }
}

module.exports = {
  list,
  create,
  get,
  update,
  remove
};
