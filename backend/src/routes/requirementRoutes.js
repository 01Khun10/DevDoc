const express = require("express");
const requirementController = require("../controllers/requirementController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router.get("/", requirementController.list);
router.post("/", requirementController.create);
router.get("/:requirementId", requirementController.get);
router.put("/:requirementId", requirementController.update);

module.exports = router;
