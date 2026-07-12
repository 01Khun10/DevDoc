const express = require("express");
const projectController = require("../controllers/projectController");
const shareController = require("../controllers/shareController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", projectController.create);
router.get("/", projectController.list);
router.get("/:id", projectController.get);
router.get("/:id/overview", projectController.getProjectOverview);
router.put("/:id", projectController.update);
router.post("/:id/share", shareController.create);

module.exports = router;
