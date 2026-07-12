const express = require("express");
const businessObjectiveController = require("../controllers/businessObjectiveController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router.get("/", businessObjectiveController.list);
router.post("/", businessObjectiveController.create);
router.get("/:objectiveId", businessObjectiveController.get);
router.patch("/:objectiveId", businessObjectiveController.update);
router.delete("/:objectiveId", businessObjectiveController.remove);

module.exports = router;
