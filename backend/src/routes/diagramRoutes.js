const express = require("express");
const diagramController = require("../controllers/diagramController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router.get("/traceability-tree/plantuml", diagramController.getTraceabilityTreePlantUml);
router.get("/use-case/plantuml", diagramController.getUseCasePlantUml);
router.get("/component/plantuml", diagramController.getComponentPlantUml);

module.exports = router;
