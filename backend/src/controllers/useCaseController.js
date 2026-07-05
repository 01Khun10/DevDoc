const {
  validateCreateUseCaseInput,
  validateUpdateUseCaseInput
} = require("../validators/useCaseValidator");
const {
  PROJECT_NOT_FOUND,
  USE_CASE_NOT_FOUND,
  createUseCase,
  getUseCases,
  getUseCaseById,
  updateUseCase
} = require("../services/useCaseService");
const { sendError, sendUnexpectedError } = require("../utils/httpErrors");

async function list(req, res) {
  try {
    const useCases = await getUseCases(req.user.id, req.params.projectId);
    return res.status(200).json({ useCases });
  } catch (error) {
    if (error.code === PROJECT_NOT_FOUND) {
      return sendError(res, 404, "Project not found");
    }

    return sendUnexpectedError(res, error, "useCaseController.list");
  }
}

async function create(req, res) {
  const validation = validateCreateUseCaseInput(req.body);

  if (!validation.isValid) {
    return sendError(res, 400, "Validation failed", validation.fields);
  }

  try {
    const useCase = await createUseCase(req.user.id, req.params.projectId, validation.values);

    return res.status(201).json({ useCase });
  } catch (error) {
    if (error.code === PROJECT_NOT_FOUND) {
      return sendError(res, 404, "Project not found");
    }

    return sendUnexpectedError(res, error, "useCaseController.create");
  }
}

async function get(req, res) {
  try {
    const useCase = await getUseCaseById(
      req.user.id,
      req.params.projectId,
      req.params.useCaseId
    );

    return res.status(200).json({ useCase });
  } catch (error) {
    if (error.code === USE_CASE_NOT_FOUND) {
      return sendError(res, 404, "Use case not found");
    }

    return sendUnexpectedError(res, error, "useCaseController.get");
  }
}

async function update(req, res) {
  const validation = validateUpdateUseCaseInput(req.body);

  if (!validation.isValid) {
    return sendError(res, 400, "Validation failed", validation.fields);
  }

  try {
    const useCase = await updateUseCase(
      req.user.id,
      req.params.projectId,
      req.params.useCaseId,
      validation.values
    );

    return res.status(200).json({ useCase });
  } catch (error) {
    if (error.code === USE_CASE_NOT_FOUND) {
      return sendError(res, 404, "Use case not found");
    }

    return sendUnexpectedError(res, error, "useCaseController.update");
  }
}

module.exports = {
  list,
  create,
  get,
  update
};
