const {
  PROFILE_NOT_FOUND,
  TEMPLATE_NOT_FOUND,
  getProfiles,
  getTemplatesByProfileCode,
  getTemplateByCode,
  getTemplateSections
} = require("../services/templateService");
const { sendError, sendUnexpectedError } = require("../utils/httpErrors");

async function listProfiles(req, res) {
  try {
    const profiles = await getProfiles();
    return res.status(200).json({ profiles });
  } catch (error) {
    return sendUnexpectedError(res, error, "templateController.listProfiles");
  }
}

async function listTemplatesByProfile(req, res) {
  try {
    const result = await getTemplatesByProfileCode(req.params.profileCode);
    return res.status(200).json(result);
  } catch (error) {
    if (error.code === PROFILE_NOT_FOUND) {
      return sendError(res, 404, "Profile not found");
    }

    return sendUnexpectedError(res, error, "templateController.listTemplatesByProfile");
  }
}

async function getTemplate(req, res) {
  try {
    const template = await getTemplateByCode(req.params.templateCode);
    return res.status(200).json({ template });
  } catch (error) {
    if (error.code === TEMPLATE_NOT_FOUND) {
      return sendError(res, 404, "Template not found");
    }

    return sendUnexpectedError(res, error, "templateController.getTemplate");
  }
}

async function getSections(req, res) {
  try {
    const result = await getTemplateSections(req.params.templateCode);
    return res.status(200).json(result);
  } catch (error) {
    if (error.code === TEMPLATE_NOT_FOUND) {
      return sendError(res, 404, "Template not found");
    }

    return sendUnexpectedError(res, error, "templateController.getSections");
  }
}

module.exports = {
  listProfiles,
  listTemplatesByProfile,
  getTemplate,
  getSections
};
