const {
  validateCreateDocumentFromTemplateInput,
  validateUpdateDocumentSectionInput
} = require("../validators/documentValidator");
const {
  PROJECT_NOT_FOUND,
  TEMPLATE_NOT_FOUND,
  PROFILE_MISMATCH,
  DOCUMENT_NOT_FOUND,
  SECTION_NOT_FOUND,
  createDocumentFromTemplate,
  getDocumentById,
  updateDocumentSection,
  getSectionLinkedArtefacts: getSectionLinkedArtefactsService
} = require("../services/documentService");
const { sendError, sendUnexpectedError } = require("../utils/httpErrors");

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

    return sendUnexpectedError(res, error, "documentController.createFromTemplate");
  }
}

async function getDocument(req, res) {
  try {
    const document = await getDocumentById(
      req.user.id,
      req.params.projectId,
      req.params.documentId
    );

    return res.status(200).json({ document });
  } catch (error) {
    if (error.code === DOCUMENT_NOT_FOUND) {
      return sendError(res, 404, "Document not found");
    }

    return sendUnexpectedError(res, error, "documentController.getDocument");
  }
}

async function updateSection(req, res) {
  const validation = validateUpdateDocumentSectionInput(req.body);

  if (!validation.isValid) {
    return sendError(res, 400, "Validation failed", validation.fields);
  }

  try {
    const result = await updateDocumentSection(
      req.user.id,
      req.params.projectId,
      req.params.documentId,
      req.params.sectionId,
      validation.values
    );

    return res.status(200).json(result);
  } catch (error) {
    if (error.code === DOCUMENT_NOT_FOUND) {
      return sendError(res, 404, "Document not found");
    }

    if (error.code === SECTION_NOT_FOUND) {
      return sendError(res, 404, "Section not found");
    }

    return sendUnexpectedError(res, error, "documentController.updateSection");
  }
}

async function getSectionLinkedArtefacts(req, res) {
  try {
    const result = await getSectionLinkedArtefactsService(
      req.user.id,
      req.params.projectId,
      req.params.documentId,
      req.params.sectionId
    );

    return res.status(200).json(result);
  } catch (error) {
    if (error.code === DOCUMENT_NOT_FOUND) {
      return sendError(res, 404, "Document not found");
    }

    if (error.code === SECTION_NOT_FOUND) {
      return sendError(res, 404, "Section not found");
    }

    return sendUnexpectedError(res, error, "documentController.getSectionLinkedArtefacts");
  }
}

module.exports = {
  createFromTemplate,
  getDocument,
  updateSection,
  getSectionLinkedArtefacts
};
