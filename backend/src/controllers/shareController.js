const { PROJECT_NOT_FOUND } = require("../constants/errorCodes");
const { SHARE_TOKEN_NOT_FOUND, createShareToken, getSharedReport } = require("../services/shareService");
const { sendError, sendUnexpectedError } = require("../utils/httpErrors");

async function create(req, res) {
  try {
    const { token, expiresAt } = await createShareToken(req.user.id, req.params.id, req.body?.expiresAt);
    return res.status(201).json({ token, expiresAt, url: `/shared/${token}` });
  } catch (error) {
    if (error.code === PROJECT_NOT_FOUND) {
      return sendError(res, 404, "Project not found");
    }
    if (error.code === "INVALID_EXPIRY") {
      return sendError(res, 400, error.message);
    }
    return sendUnexpectedError(res, error, "shareController.create");
  }
}

async function getReport(req, res) {
  try {
    const report = await getSharedReport(req.params.token);
    return res.status(200).json(report);
  } catch (error) {
    if (error.code === SHARE_TOKEN_NOT_FOUND) {
      return sendError(res, 404, "Share link not found or expired");
    }
    return sendUnexpectedError(res, error, "shareController.getReport");
  }
}

module.exports = { create, getReport };
