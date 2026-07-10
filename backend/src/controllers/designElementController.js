const {
  validateCreateDesignElementInput,
  validateUpdateDesignElementInput
} = require("../validators/designElementValidator");
const {
  PROJECT_NOT_FOUND,
  DESIGN_ELEMENT_NOT_FOUND,
  createDesignElement,
  getDesignElements,
  getDesignElementById,
  updateDesignElement,
  deleteDesignElement
} = require("../services/designElementService");
const { sendError, sendUnexpectedError } = require("../utils/httpErrors");

async function list(req, res) {
  try {
    const designElements = await getDesignElements(req.user.id, req.params.projectId);
    return res.status(200).json({ designElements });
  } catch (error) {
    if (error.code === PROJECT_NOT_FOUND) {
      return sendError(res, 404, "Project not found");
    }

    return sendUnexpectedError(res, error, "designElementController.list");
  }
}

async function create(req, res) {
  const validation = validateCreateDesignElementInput(req.body);

  if (!validation.isValid) {
    return sendError(res, 400, "Validation failed", validation.fields);
  }

  try {
    const designElement = await createDesignElement(
      req.user.id,
      req.params.projectId,
      validation.values
    );

    return res.status(201).json({ designElement });
  } catch (error) {
    if (error.code === PROJECT_NOT_FOUND) {
      return sendError(res, 404, "Project not found");
    }

    return sendUnexpectedError(res, error, "designElementController.create");
  }
}

async function get(req, res) {
  try {
    const designElement = await getDesignElementById(
      req.user.id,
      req.params.projectId,
      req.params.designElementId
    );

    return res.status(200).json({ designElement });
  } catch (error) {
    if (error.code === DESIGN_ELEMENT_NOT_FOUND) {
      return sendError(res, 404, "Design element not found");
    }

    return sendUnexpectedError(res, error, "designElementController.get");
  }
}

async function update(req, res) {
  const validation = validateUpdateDesignElementInput(req.body);

  if (!validation.isValid) {
    return sendError(res, 400, "Validation failed", validation.fields);
  }

  try {
    const designElement = await updateDesignElement(
      req.user.id,
      req.params.projectId,
      req.params.designElementId,
      validation.values
    );

    return res.status(200).json({ designElement });
  } catch (error) {
    if (error.code === DESIGN_ELEMENT_NOT_FOUND) {
      return sendError(res, 404, "Design element not found");
    }

    return sendUnexpectedError(res, error, "designElementController.update");
  }
}

async function remove(req, res) {
  try {
    const result = await deleteDesignElement(
      req.user.id,
      req.params.projectId,
      req.params.designElementId
    );

    return res.status(200).json(result);
  } catch (error) {
    if (error.code === DESIGN_ELEMENT_NOT_FOUND) {
      return sendError(res, 404, "Design element not found");
    }

    return sendUnexpectedError(res, error, "designElementController.remove");
  }
}

module.exports = {
  list,
  create,
  get,
  update,
  remove
};
