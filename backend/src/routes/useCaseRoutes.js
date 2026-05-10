const express = require("express");
const useCaseController = require("../controllers/useCaseController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router.get("/", useCaseController.list);
router.post("/", useCaseController.create);
router.get("/:useCaseId", useCaseController.get);
router.put("/:useCaseId", useCaseController.update);

module.exports = router;
