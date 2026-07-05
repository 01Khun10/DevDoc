const {
  PROJECT_NOT_FOUND,
  generateTraceabilityTreePlantUml
} = require("../services/diagramService");
const { sendError, sendUnexpectedError } = require("../utils/httpErrors");

async function getTraceabilityTreePlantUml(req, res) {
  try {
    const diagram = await generateTraceabilityTreePlantUml(
      req.user.id,
      req.params.projectId
    );

    return res.status(200).json({ diagram });
  } catch (error) {
    if (error.code === PROJECT_NOT_FOUND) {
      return sendError(res, 404, "Project not found");
    }

    return sendUnexpectedError(res, error, "diagramController.getTraceabilityTreePlantUml");
  }
}

module.exports = {
  getTraceabilityTreePlantUml
};
