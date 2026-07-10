const {
  validateCreateTestCaseInput,
  validateUpdateTestCaseInput
} = require("../validators/testCaseValidator");
const {
  PROJECT_NOT_FOUND,
  TEST_CASE_NOT_FOUND,
  createTestCase,
  getTestCases,
  getTestCaseById,
  updateTestCase,
  deleteTestCase
} = require("../services/testCaseService");
const { sendError, sendUnexpectedError } = require("../utils/httpErrors");

async function list(req, res) {
  try {
    const testCases = await getTestCases(req.user.id, req.params.projectId);
    return res.status(200).json({ testCases });
  } catch (error) {
    if (error.code === PROJECT_NOT_FOUND) {
      return sendError(res, 404, "Project not found");
    }

    return sendUnexpectedError(res, error, "testCaseController.list");
  }
}

async function create(req, res) {
  const validation = validateCreateTestCaseInput(req.body);

  if (!validation.isValid) {
    return sendError(res, 400, "Validation failed", validation.fields);
  }

  try {
    const testCase = await createTestCase(
      req.user.id,
      req.params.projectId,
      validation.values
    );

    return res.status(201).json({ testCase });
  } catch (error) {
    if (error.code === PROJECT_NOT_FOUND) {
      return sendError(res, 404, "Project not found");
    }

    return sendUnexpectedError(res, error, "testCaseController.create");
  }
}

async function get(req, res) {
  try {
    const testCase = await getTestCaseById(
      req.user.id,
      req.params.projectId,
      req.params.testCaseId
    );

    return res.status(200).json({ testCase });
  } catch (error) {
    if (error.code === TEST_CASE_NOT_FOUND) {
      return sendError(res, 404, "Test case not found");
    }

    return sendUnexpectedError(res, error, "testCaseController.get");
  }
}

async function update(req, res) {
  const validation = validateUpdateTestCaseInput(req.body);

  if (!validation.isValid) {
    return sendError(res, 400, "Validation failed", validation.fields);
  }

  try {
    const testCase = await updateTestCase(
      req.user.id,
      req.params.projectId,
      req.params.testCaseId,
      validation.values
    );

    return res.status(200).json({ testCase });
  } catch (error) {
    if (error.code === TEST_CASE_NOT_FOUND) {
      return sendError(res, 404, "Test case not found");
    }

    return sendUnexpectedError(res, error, "testCaseController.update");
  }
}

async function remove(req, res) {
  try {
    const result = await deleteTestCase(
      req.user.id,
      req.params.projectId,
      req.params.testCaseId
    );

    return res.status(200).json(result);
  } catch (error) {
    if (error.code === TEST_CASE_NOT_FOUND) {
      return sendError(res, 404, "Test case not found");
    }

    return sendUnexpectedError(res, error, "testCaseController.remove");
  }
}

module.exports = {
  list,
  create,
  get,
  update,
  remove
};
