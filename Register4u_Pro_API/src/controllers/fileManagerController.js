const { FileNode } = require("../models");
const { asyncHandler } = require("../middleware/errorHandler");
const fs = require("fs"); // For now assuming local fs for simulation or simple storage
// If actual S3 is needed, user didn't specify credentials, so we'll simulate or use local path logic if upload middleware is present.
// Assuming "uploads/" static serve from previous knowledge of project.

exports.getNodes = asyncHandler(async (req, res) => {
  const { parentId } = req.query;

  const query = parentId ? { parentId } : { parentId: null };

  const nodes = await FileNode.find(query).sort({ type: -1, name: 1 }); // Folders first, then files

  res.json({
    success: true,
    data: nodes,
  });
});

exports.createFolder = asyncHandler(async (req, res) => {
  const { name, parentId } = req.body;

  const node = await FileNode.create({
    name,
    type: "folder",
    parentId: parentId || null,
  });

  res.status(201).json({
    success: true,
    data: node,
  });
});

// Seed Initial Folders
exports.seedDefaults = asyncHandler(async (req, res) => {
  // Create default folders directly at root level (parentId: null)
  const defaults = [
    "Backgrounds",
    "Badge", 
    "gst_certificate",
    "idproof",
    "photo",
    "vaccine",
  ];

  for (const folderName of defaults) {
    const exists = await FileNode.findOne({
      name: folderName,
      parentId: null, // Root level
    });
    if (!exists) {
      await FileNode.create({
        name: folderName,
        type: "folder",
        parentId: null, // Root level
      });
    }
  }

  res.json({ success: true, message: "Initialized default folders at root level" });
});

// Reset and recreate default folders (for clean setup)
exports.resetDefaults = asyncHandler(async (req, res) => {
  // Delete all existing file manager nodes
  await FileNode.deleteMany({});
  
  // Create default folders at root level
  const defaults = [
    "Backgrounds",
    "Badge", 
    "gst_certificate",
    "idproof",
    "photo",
    "vaccine",
  ];

  for (const folderName of defaults) {
    await FileNode.create({
      name: folderName,
      type: "folder",
      parentId: null, // Root level
    });
  }

  res.json({ success: true, message: "Reset and created default folders at root level" });
});

exports.uploadFile = asyncHandler(async (req, res) => {
  console.log("📁 File upload request received");
  console.log("📁 Request body:", req.body);
  console.log("📁 Request file:", req.file);
  console.log("📁 Request files:", req.files);
  console.log("📁 Content-Type:", req.headers['content-type']);

  if (!req.file) {
    console.log("❌ No file found in request");
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }

  const { parentId } = req.body;

  // Construct local URL for static file serving
  const fileUrl = `/uploads/${req.file.filename}`;

  const node = await FileNode.create({
    name: req.file.originalname,
    type: "file",
    parentId: parentId || null,
    url: fileUrl,
    size: req.file.size,
    mimeType: req.file.mimetype,
  });

  console.log(`✅ Uploaded: ${req.file.originalname} (${req.file.size} bytes)`);

  res.status(201).json({ success: true, data: node });
});

// Rename a node (file or folder)
exports.renameNode = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ success: false, message: "Name is required" });
  }

  const node = await FileNode.findByIdAndUpdate(
    id,
    { name: name.trim() },
    { new: true }
  );

  if (!node) {
    return res.status(404).json({ success: false, message: "Node not found" });
  }

  res.json({ success: true, data: node });
});

// Bulk delete nodes
exports.bulkDelete = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: "IDs array is required" });
  }

  let deletedCount = 0;
  const errors = [];

  for (const id of ids) {
    try {
      await deleteRecursive(id);
      deletedCount++;
    } catch (error) {
      errors.push(`Failed to delete ${id}: ${error.message}`);
    }
  }

  res.json({
    success: true,
    message: `Deleted ${deletedCount} items`,
    deletedCount,
    errors: errors.length > 0 ? errors : undefined
  });
});

exports.deleteNode = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await deleteRecursive(id);

  res.json({ success: true, message: "Deleted" });
});

async function deleteRecursive(nodeId) {
  const node = await FileNode.findById(nodeId);
  if (!node) return;

  if (node.type === "folder") {
    // Delete all children first
    const children = await FileNode.find({ parentId: nodeId });
    for (const child of children) {
      await deleteRecursive(child._id);
    }
  } else if (node.type === "file" && node.url) {
    // Delete actual file from disk
    try {
      const path = require("path");
      const filename = node.url.replace("/uploads/", "");
      const filePath = path.join(__dirname, "../../uploads", filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Deleted file: ${filename}`);
      }
    } catch (error) {
      console.error(`❌ Failed to delete file: ${error.message}`);
    }
  }

  // Delete the node from database
  await FileNode.findByIdAndDelete(nodeId);
}
