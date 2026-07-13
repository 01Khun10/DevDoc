const express = require("express");
const searchController = require("../controllers/searchController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", searchController.search);

module.exports = router;
