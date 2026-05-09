const express = require("express");
const documentController = require("../controllers/documentController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router.post("/from-template", documentController.createFromTemplate);

module.exports = router;
