const {
  PROJECT_NOT_FOUND,
  RUN_NOT_FOUND,
  runProjectValidation,
  getValidationRuns,
  getValidationRunById
} = require("../services/validationService");
const { sendError, sendUnexpectedError } = require("../utils/httpErrors");

function mapServiceError(res, error, context) {
  if (error.code === PROJECT_NOT_FOUND) {
    return sendError(res, 404, "Project not found");
  }

  if (error.code === RUN_NOT_FOUND) {
    return sendError(res, 404, "Validation run not found");
  }

  return sendUnexpectedError(res, error, context);
}

async function run(req, res) {
  try {
    const validationRun = await runProjectValidation(req.user.id, req.params.projectId);
    return res.status(201).json({ validationRun });
  } catch (error) {
    return mapServiceError(res, error, "validationController.run");
  }
}

async function list(req, res) {
  try {
    const validationRuns = await getValidationRuns(req.user.id, req.params.projectId);
    return res.status(200).json({ validationRuns });
  } catch (error) {
    return mapServiceError(res, error, "validationController.list");
  }
}

async function get(req, res) {
  try {
    const validationRun = await getValidationRunById(
      req.user.id,
      req.params.projectId,
      req.params.runId
    );

    return res.status(200).json({ validationRun });
  } catch (error) {
    return mapServiceError(res, error, "validationController.get");
  }
}

module.exports = {
  run,
  list,
  get
};
