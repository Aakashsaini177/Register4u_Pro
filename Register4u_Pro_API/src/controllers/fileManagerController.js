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

  res.json({
    success: true,
    message: "Initialized default folders at root level",
  });
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

  res.json({
    success: true,
    message: "Reset and created default folders at root level",
  });
});

// Sync existing files to file manager
exports.syncExistingFiles = asyncHandler(async (req, res) => {
  const { syncExistingFilesToFileManager } = require("../utils/syncExistingFilesToFileManager");
  
  try {
    const result = await syncExistingFilesToFileManager();
    
    res.json({
      success: true,
      message: "Successfully synced existing files to file manager",
      data: result,
    });
  } catch (error) {
    console.error("Sync existing files error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to sync existing files",
      error: error.message,
    });
  }
});

// Sync Cloudinary files to file manager
exports.syncCloudinaryFiles = asyncHandler(async (req, res) => {
  const { syncCloudinaryToFileManager } = require("../utils/syncCloudinaryToFileManager");
  
  try {
    const result = await syncCloudinaryToFileManager();
    
    res.json({
      success: true,
      message: "Successfully synced Cloudinary files to file manager",
      data: result,
    });
  } catch (error) {
    console.error("Sync Cloudinary files error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to sync Cloudinary files",
      error: error.message,
    });
  }
});

// Debug endpoint to check file URLs
exports.debugFiles = asyncHandler(async (req, res) => {
  const fs = require("fs");
  const path = require("path");
  
  try {
    // Get all files from file manager
    const allFiles = await FileNode.find({ type: "file" });
    
    // Separate files by URL type
    const cloudinaryFiles = [];
    const localFiles = [];
    const problematicFiles = [];
    
    allFiles.forEach(file => {
      if (file.url && (file.url.includes('cloudinary') || file.url.startsWith('http'))) {
        cloudinaryFiles.push(file);
      } else if (file.url && file.url.startsWith('/uploads/')) {
        localFiles.push(file);
        
        // Check if local file exists
        const uploadsDir = path.join(__dirname, "../../uploads");
        const fileName = path.basename(file.url);
        const physicalPath = path.join(uploadsDir, fileName);
        
        if (!fs.existsSync(physicalPath)) {
          problematicFiles.push({
            name: file.name,
            url: file.url,
            physicalPath: physicalPath,
            exists: false,
            _id: file._id
          });
        }
      }
    });
    
    res.json({
      success: true,
      summary: {
        total: allFiles.length,
        cloudinary: cloudinaryFiles.length,
        local: localFiles.length,
        problematic: problematicFiles.length
      },
      problematicFiles: problematicFiles.slice(0, 10), // Show first 10
      cloudinaryFiles: cloudinaryFiles.slice(0, 5).map(f => ({ name: f.name, url: f.url })),
      localFiles: localFiles.slice(0, 5).map(f => ({ name: f.name, url: f.url }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Fix problematic files by removing them or updating URLs
exports.fixProblematicFiles = asyncHandler(async (req, res) => {
  try {
    // Find files with /uploads/ URLs that don't exist physically
    const fs = require("fs");
    const path = require("path");
    const uploadsDir = path.join(__dirname, "../../uploads");
    
    const localFiles = await FileNode.find({ 
      type: "file", 
      url: { $regex: "^/uploads/" } 
    });
    
    let removedCount = 0;
    let fixedCount = 0;
    
    for (const file of localFiles) {
      const fileName = path.basename(file.url);
      const physicalPath = path.join(uploadsDir, fileName);
      
      if (!fs.existsSync(physicalPath)) {
        // Try to find corresponding visitor/company with Cloudinary URL
        const { Visitor, Company } = require("../models");
        
        // Check if this is a visitor photo
        if (file.name.match(/^[A-Z]{2}\d+\.(jpg|jpeg|png)$/i)) {
          const visitorId = file.name.replace(/\.(jpg|jpeg|png)$/i, '');
          const visitor = await Visitor.findOne({ visitorId });
          
          if (visitor && visitor.photo && visitor.photo.includes('cloudinary')) {
            // Update file manager entry with Cloudinary URL
            await FileNode.findByIdAndUpdate(file._id, { url: visitor.photo });
            fixedCount++;
            console.log(`✅ Fixed ${file.name} with Cloudinary URL`);
            continue;
          }
        }
        
        // Check if this is an ID proof document
        if (file.name.match(/^(aadhrFR|aadhrBK|PAN|PANBACK)_[A-Z]{2}\d+\.(jpg|jpeg|png)$/i)) {
          const visitorId = file.name.replace(/^(aadhrFR|aadhrBK|PAN|PANBACK)_/, '').replace(/\.(jpg|jpeg|png)$/i, '');
          const visitor = await Visitor.findOne({ visitorId });
          
          if (visitor && visitor.documents) {
            let cloudinaryUrl = null;
            
            if (file.name.startsWith('aadhrFR_') && visitor.documents.aadharFront?.includes('cloudinary')) {
              cloudinaryUrl = visitor.documents.aadharFront;
            } else if (file.name.startsWith('aadhrBK_') && visitor.documents.aadharBack?.includes('cloudinary')) {
              cloudinaryUrl = visitor.documents.aadharBack;
            } else if (file.name.startsWith('PAN_') && visitor.documents.panFront?.includes('cloudinary')) {
              cloudinaryUrl = visitor.documents.panFront;
            } else if (file.name.startsWith('PANBACK_') && visitor.documents.panBack?.includes('cloudinary')) {
              cloudinaryUrl = visitor.documents.panBack;
            }
            
            if (cloudinaryUrl) {
              await FileNode.findByIdAndUpdate(file._id, { url: cloudinaryUrl });
              fixedCount++;
              console.log(`✅ Fixed ${file.name} with Cloudinary URL`);
              continue;
            }
          }
        }
        
        // Check if this is a GST certificate
        if (file.name.match(/^GST_[A-Z0-9]+\.(pdf|jpg|jpeg|png)$/i)) {
          const companyId = file.name.replace(/^GST_/, '').replace(/\.(pdf|jpg|jpeg|png)$/i, '');
          const company = await Company.findOne({ companyId });
          
          if (company && company.gst_certificate && company.gst_certificate.includes('cloudinary')) {
            await FileNode.findByIdAndUpdate(file._id, { url: company.gst_certificate });
            fixedCount++;
            console.log(`✅ Fixed ${file.name} with Cloudinary URL`);
            continue;
          }
        }
        
        // If no Cloudinary URL found, remove the problematic entry
        await FileNode.findByIdAndDelete(file._id);
        removedCount++;
        console.log(`🗑️ Removed problematic file: ${file.name}`);
      }
    }
    
    res.json({
      success: true,
      message: `Fixed ${fixedCount} files, removed ${removedCount} problematic entries`,
      fixedCount,
      removedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

exports.uploadFile = asyncHandler(async (req, res) => {
  console.log("📁 File upload request received");
  console.log("📁 Request body:", req.body);
  console.log("📁 Request file:", req.file);
  console.log("📁 Request files:", req.files);
  console.log("📁 Content-Type:", req.headers["content-type"]);

  if (!req.file) {
    console.log("❌ No file found in request");
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }

  const { parentId } = req.body;

  // Construct URL (Cloudinary vs Local)
  const fileUrl = req.file.path
    ? req.file.path
    : `/uploads/${req.file.filename}`;

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
    return res
      .status(400)
      .json({ success: false, message: "Name is required" });
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
    return res
      .status(400)
      .json({ success: false, message: "IDs array is required" });
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
    errors: errors.length > 0 ? errors : undefined,
  });
});

// Bulk export nodes as ZIP
exports.bulkExport = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "IDs array is required" });
  }

  const archiver = require('archiver');
  const axios = require('axios');
  
  // Create ZIP archive
  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });

  // Set response headers for ZIP download
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="exported-files-${timestamp}.zip"`);

  // Pipe archive to response
  archive.pipe(res);

  let addedCount = 0;
  const errors = [];

  try {
    for (const id of ids) {
      try {
        const node = await FileNode.findById(id);
        if (!node) {
          errors.push(`File not found: ${id}`);
          continue;
        }

        if (node.type === 'folder') {
          // Include folder contents recursively
          try {
            const folderFiles = await getFolderContentsRecursive(node._id, node.name);
            for (const folderFile of folderFiles) {
              if (folderFile.url && folderFile.url.startsWith('http')) {
                try {
                  const response = await axios({
                    method: 'GET',
                    url: folderFile.url,
                    responseType: 'stream'
                  });
                  
                  // Add file to archive with folder path
                  archive.append(response.data, { name: folderFile.path });
                  addedCount++;
                } catch (downloadError) {
                  errors.push(`Failed to download ${folderFile.path}: ${downloadError.message}`);
                }
              } else if (folderFile.url) {
                // Local file
                const path = require("path");
                const filename = folderFile.url.replace("/uploads/", "");
                const filePath = path.join(__dirname, "../../uploads", filename);
                
                if (require('fs').existsSync(filePath)) {
                  archive.file(filePath, { name: folderFile.path });
                  addedCount++;
                } else {
                  errors.push(`Local file not found: ${folderFile.path}`);
                }
              }
            }
          } catch (folderError) {
            errors.push(`Failed to process folder ${node.name}: ${folderError.message}`);
          }
          continue;
        }

        if (node.type === 'file' && node.url) {
          if (node.url.startsWith('http')) {
            // Download from Cloudinary/external URL
            try {
              const response = await axios({
                method: 'GET',
                url: node.url,
                responseType: 'stream'
              });
              
              // Add file to archive with original name
              archive.append(response.data, { name: node.name });
              addedCount++;
            } catch (downloadError) {
              errors.push(`Failed to download ${node.name}: ${downloadError.message}`);
            }
          } else {
            // Local file
            const path = require("path");
            const filename = node.url.replace("/uploads/", "");
            const filePath = path.join(__dirname, "../../uploads", filename);
            
            if (require('fs').existsSync(filePath)) {
              archive.file(filePath, { name: node.name });
              addedCount++;
            } else {
              errors.push(`Local file not found: ${node.name}`);
            }
          }
        }
      } catch (error) {
        errors.push(`Error processing ${id}: ${error.message}`);
      }
    }

    // Only add summary file if there were errors
    if (errors.length > 0) {
      const errorSummary = `Export Summary
=============

Successfully exported: ${addedCount} files
Errors encountered: ${errors.length}
Export completed at: ${new Date().toLocaleString()}

Error Details:
${errors.join('\n')}`;
      
      archive.append(errorSummary, { name: 'export-summary.txt' });
    }

    // Finalize the archive
    await archive.finalize();
    
    console.log(`✅ Bulk export completed: ${addedCount} files exported, ${errors.length} errors`);
  } catch (error) {
    console.error('❌ Bulk export error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Export failed: ' + error.message });
    }
  }
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
    // Delete actual file from disk (ONLY if local)
    if (!node.url.startsWith("http")) {
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
    } else {
      // TODO: Implement Cloudinary deletion if needed
      console.log(`☁️ Skipping local delete for Cloudinary file: ${node.name}`);
    }
  }

  // Delete the node from database
  await FileNode.findByIdAndDelete(nodeId);
}

// Helper function to get all files in a folder recursively
async function getFolderContentsRecursive(folderId, folderPath = '') {
  const files = [];
  const children = await FileNode.find({ parentId: folderId });
  
  for (const child of children) {
    if (child.type === 'file') {
      files.push({
        ...child.toObject(),
        path: folderPath ? `${folderPath}/${child.name}` : child.name
      });
    } else if (child.type === 'folder') {
      // Recursively get files from subfolders
      const subFolderPath = folderPath ? `${folderPath}/${child.name}` : child.name;
      const subFiles = await getFolderContentsRecursive(child._id, subFolderPath);
      files.push(...subFiles);
    }
  }
  
  return files;
}
