const express = require("express");
const designElementController = require("../controllers/designElementController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router.get("/", designElementController.list);
router.post("/", designElementController.create);
router.get("/:designElementId", designElementController.get);
router.put("/:designElementId", designElementController.update);
router.delete("/:designElementId", designElementController.remove);

module.exports = router;
