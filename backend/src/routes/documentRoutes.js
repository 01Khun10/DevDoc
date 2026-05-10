const express = require("express");
const documentController = require("../controllers/documentController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router.post("/from-template", documentController.createFromTemplate);
router.get("/:documentId", documentController.getDocument);
router.put("/:documentId/sections/:sectionId", documentController.updateSection);
router.get("/:documentId/sections/:sectionId/linked-artefacts", documentController.getSectionLinkedArtefacts);

module.exports = router;
