const {
  PROJECT_NOT_FOUND,
  generateTraceabilityTreePlantUml
} = require("../services/diagramService");

function sendError(res, statusCode, message, fields) {
  const error = { message };
  if (fields) {
    error.fields = fields;
  }
  return res.status(statusCode).json({ error });
}

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

    return sendError(res, 500, "Unexpected server error");
  }
}

module.exports = {
  getTraceabilityTreePlantUml
};
