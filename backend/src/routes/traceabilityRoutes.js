const express = require("express");
const traceabilityController = require("../controllers/traceabilityController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router.get("/", traceabilityController.list);
router.get("/options", traceabilityController.options);
router.post("/", traceabilityController.create);
router.patch("/:linkId/verify", traceabilityController.verify);
router.delete("/:linkId", traceabilityController.remove);

module.exports = router;
