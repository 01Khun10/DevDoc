const { validateCreateTraceabilityLinkInput } = require("../validators/traceabilityValidator");
const {
  PROJECT_NOT_FOUND,
  SOURCE_NOT_FOUND,
  TARGET_NOT_FOUND,
  LINK_NOT_FOUND,
  DUPLICATE_LINK,
  UNSUPPORTED_LINK_TYPE,
  getTraceabilityLinks,
  getTraceabilityOptions,
  createTraceabilityLink,
  verifyTraceabilityLink,
  deleteTraceabilityLink
} = require("../services/traceabilityService");
const { sendError, sendUnexpectedError } = require("../utils/httpErrors");

function mapServiceError(res, error, context) {
  if (error.code === PROJECT_NOT_FOUND) {
    return sendError(res, 404, "Project not found");
  }

  if (error.code === SOURCE_NOT_FOUND) {
    return sendError(res, 404, "Source artefact not found");
  }

  if (error.code === TARGET_NOT_FOUND) {
    return sendError(res, 404, "Target artefact not found");
  }

  if (error.code === LINK_NOT_FOUND) {
    return sendError(res, 404, "Traceability link not found");
  }

  if (error.code === DUPLICATE_LINK) {
    return sendError(res, 400, "Traceability link already exists");
  }

  if (error.code === UNSUPPORTED_LINK_TYPE) {
    return sendError(res, 400, "Unsupported traceability link type");
  }

  return sendUnexpectedError(res, error, context);
}

async function list(req, res) {
  try {
    const traceabilityLinks = await getTraceabilityLinks(req.user.id, req.params.projectId);
    return res.status(200).json({ traceabilityLinks });
  } catch (error) {
    return mapServiceError(res, error, "traceabilityController.list");
  }
}

async function options(req, res) {
  try {
    const traceabilityOptions = await getTraceabilityOptions(req.user.id, req.params.projectId);
    return res.status(200).json(traceabilityOptions);
  } catch (error) {
    return mapServiceError(res, error, "traceabilityController.options");
  }
}

async function create(req, res) {
  const validation = validateCreateTraceabilityLinkInput(req.body);

  if (validation.isUnsupportedPair) {
    return sendError(res, 400, "Unsupported traceability link type");
  }

  if (!validation.isValid) {
    return sendError(res, 400, "Validation failed", validation.fields);
  }

  try {
    const traceabilityLink = await createTraceabilityLink(
      req.user.id,
      req.params.projectId,
      validation.values
    );

    return res.status(201).json({ traceabilityLink });
  } catch (error) {
    return mapServiceError(res, error, "traceabilityController.create");
  }
}

async function verify(req, res) {
  try {
    const traceabilityLink = await verifyTraceabilityLink(
      req.user.id,
      req.params.projectId,
      req.params.linkId
    );

    return res.status(200).json({ traceabilityLink });
  } catch (error) {
    return mapServiceError(res, error, "traceabilityController.verify");
  }
}

async function remove(req, res) {
  try {
    const result = await deleteTraceabilityLink(
      req.user.id,
      req.params.projectId,
      req.params.linkId
    );

    return res.status(200).json(result);
  } catch (error) {
    return mapServiceError(res, error, "traceabilityController.remove");
  }
}

module.exports = {
  list,
  options,
  create,
  verify,
  remove
};
