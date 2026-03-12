const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const router = express.Router();

const collectionController = require("../controllers/collectionController");

router.post("/", authenticate, collectionController.createCollection);
router.get("/", authenticate, collectionController.getCollections);
router.get("/:id", authenticate, collectionController.getCollection);
router.put("/:id", authenticate, collectionController.updateCollection);
router.delete("/:id", authenticate, collectionController.deleteCollection);

router.post("/:id/papers", authenticate, collectionController.addPaper);
router.delete("/:id/papers/:paperId", authenticate, collectionController.removePaper);

module.exports = router;
