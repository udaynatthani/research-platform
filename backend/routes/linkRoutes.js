const express = require("express");
const router = express.Router();

const linkController = require("../controllers/linkController");

router.post("/", linkController.createLink);
router.get("/", linkController.getLinks);

module.exports = router;