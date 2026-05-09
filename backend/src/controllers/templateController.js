const {
  PROFILE_NOT_FOUND,
  TEMPLATE_NOT_FOUND,
  getProfiles,
  getTemplatesByProfileCode,
  getTemplateByCode,
  getTemplateSections
} = require("../services/templateService");

function sendError(res, statusCode, message) {
  return res.status(statusCode).json({
    error: {
      message
    }
  });
}

async function listProfiles(req, res) {
  try {
    const profiles = await getProfiles();
    return res.status(200).json({ profiles });
  } catch (error) {
    return sendError(res, 500, "Unexpected server error");
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

    return sendError(res, 500, "Unexpected server error");
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

    return sendError(res, 500, "Unexpected server error");
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

    return sendError(res, 500, "Unexpected server error");
  }
}

module.exports = {
  listProfiles,
  listTemplatesByProfile,
  getTemplate,
  getSections
};
