const express = require("express");
const projectController = require("../controllers/projectController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", projectController.create);
router.get("/", projectController.list);
router.get("/:id", projectController.get);
router.put("/:id", projectController.update);

module.exports = router;
