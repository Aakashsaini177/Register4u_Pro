const express = require("express");
const {
  getNodes,
  createFolder,
  seedDefaults,
  uploadFile,
  deleteNode,
  renameNode,
  bulkDelete,
  bulkExport,
  resetDefaults,
  syncExistingFiles,
  syncCloudinaryFiles,
  debugFiles,
  fixProblematicFiles,
} = require("../controllers/fileManagerController");
const { authenticate } = require("../middleware/auth");
const fileManagerUpload = require("../middleware/fileManagerUpload");

const router = express.Router();

// Debug endpoint (no auth for testing)
router.get("/debug", debugFiles);
router.post("/sync-cloudinary", syncCloudinaryFiles); // Sync Cloudinary files (no auth for testing)
router.post("/fix-problematic", fixProblematicFiles); // Fix problematic files (no auth for testing)

router.use(authenticate);

router.get("/list", getNodes); // Query param ?parentId=...
router.post("/folder", createFolder);
router.post("/seed", seedDefaults);
router.post("/reset", resetDefaults); // Reset and recreate defaults
router.post("/sync-existing", syncExistingFiles); // Sync existing files to file manager
router.post("/upload", fileManagerUpload.single("file"), uploadFile);
router.put("/:id/rename", renameNode);
router.post("/bulk-delete", bulkDelete);
router.post("/bulk-export", bulkExport);
router.delete("/:id", deleteNode);

module.exports = router;
