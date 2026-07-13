const {
  PROJECT_NOT_FOUND,
  generateTraceabilityTreePlantUml,
  generateUseCasePlantUml,
  generateComponentPlantUml
} = require("../services/diagramService");
const { sendError, sendUnexpectedError } = require("../utils/httpErrors");

function makeDiagramHandler(generator, contextLabel) {
  return async function handler(req, res) {
    try {
      const diagram = await generator(req.user.id, req.params.projectId);

      return res.status(200).json({ diagram });
    } catch (error) {
      if (error.code === PROJECT_NOT_FOUND) {
        return sendError(res, 404, "Project not found");
      }

      return sendUnexpectedError(res, error, contextLabel);
    }
  };
}

module.exports = {
  getTraceabilityTreePlantUml: makeDiagramHandler(
    generateTraceabilityTreePlantUml,
    "diagramController.getTraceabilityTreePlantUml"
  ),
  getUseCasePlantUml: makeDiagramHandler(
    generateUseCasePlantUml,
    "diagramController.getUseCasePlantUml"
  ),
  getComponentPlantUml: makeDiagramHandler(
    generateComponentPlantUml,
    "diagramController.getComponentPlantUml"
  )
};
