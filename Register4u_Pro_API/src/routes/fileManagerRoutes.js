const express = require("express");
const {
  getNodes,
  createFolder,
  seedDefaults,
  uploadFile,
  deleteNode,
  renameNode,
  bulkDelete,
  resetDefaults,
} = require("../controllers/fileManagerController");
const { authenticate } = require("../middleware/auth");
const fileManagerUpload = require("../middleware/fileManagerUpload");

const router = express.Router();

router.use(authenticate);

router.get("/list", getNodes); // Query param ?parentId=...
router.post("/folder", createFolder);
router.post("/seed", seedDefaults);
router.post("/reset", resetDefaults); // Reset and recreate defaults
router.post("/upload", fileManagerUpload.single("file"), uploadFile);
router.put("/:id/rename", renameNode);
router.post("/bulk-delete", bulkDelete);
router.delete("/:id", deleteNode);

module.exports = router;
