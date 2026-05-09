const express = require("express");
const validationController = require("../controllers/validationController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router.post("/run", validationController.run);
router.get("/runs", validationController.list);
router.get("/runs/:runId", validationController.get);

module.exports = router;
