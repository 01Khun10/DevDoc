const express = require("express");
const templateController = require("../controllers/templateController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/profiles", templateController.listProfiles);
router.get("/profiles/:profileCode/templates", templateController.listTemplatesByProfile);
router.get("/:templateCode/sections", templateController.getSections);
router.get("/:templateCode", templateController.getTemplate);

module.exports = router;
