const { validateCreateDocumentFromTemplateInput } = require("../validators/documentValidator");
const {
  PROJECT_NOT_FOUND,
  TEMPLATE_NOT_FOUND,
  PROFILE_MISMATCH,
  createDocumentFromTemplate
} = require("../services/documentService");

function sendError(res, statusCode, message, fields) {
  const error = { message };

  if (fields) {
    error.fields = fields;
  }

  return res.status(statusCode).json({ error });
}

async function createFromTemplate(req, res) {
  const validation = validateCreateDocumentFromTemplateInput(req.body);

  if (!validation.isValid) {
    return sendError(res, 400, "Validation failed", validation.fields);
  }

  try {
    const document = await createDocumentFromTemplate(
      req.user.id,
      req.params.projectId,
      validation.values
    );

    return res.status(201).json({ document });
  } catch (error) {
    if (error.code === PROJECT_NOT_FOUND) {
      return sendError(res, 404, "Project not found");
    }

    if (error.code === TEMPLATE_NOT_FOUND) {
      return sendError(res, 400, "Validation failed", {
        templateCode: "Template not found"
      });
    }

    if (error.code === PROFILE_MISMATCH) {
      return sendError(res, 400, "Template profile does not match this project");
    }

    return sendError(res, 500, "Unexpected server error");
  }
}

module.exports = {
  createFromTemplate
};
