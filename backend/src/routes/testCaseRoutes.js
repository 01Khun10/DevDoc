const express = require("express");
const testCaseController = require("../controllers/testCaseController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router.get("/", testCaseController.list);
router.post("/", testCaseController.create);
router.get("/:testCaseId", testCaseController.get);
router.put("/:testCaseId", testCaseController.update);
router.delete("/:testCaseId", testCaseController.remove);

module.exports = router;
