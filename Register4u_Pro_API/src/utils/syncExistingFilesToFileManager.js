const { Visitor, Company, FileNode } = require("../models");
const path = require("path");
const fs = require("fs");

/**
 * Utility to sync existing visitor and company files to file manager
 * This should be run once after implementing the new file manager sync feature
 */
const syncExistingFilesToFileManager = async () => {
  console.log("🔄 Starting sync of existing files to file manager...");

  try {
    // Ensure default folders exist
    const defaultFolders = ["photo", "idproof", "gst_certificate"];
    
    for (const folderName of defaultFolders) {
      let folder = await FileNode.findOne({
        name: folderName,
        type: "folder",
        parentId: null,
      });

      if (!folder) {
        folder = await FileNode.create({
          name: folderName,
          type: "folder",
          parentId: null,
        });
        console.log(`📁 Created folder: ${folderName}`);
      }
    }

    // Helper function to add file to file manager
    const addFileToManager = async (filePath, newFileName, folderName) => {
      try {
        if (!filePath || !newFileName) return false;

        // Find folder
        const folder = await FileNode.findOne({
          name: folderName,
          type: "folder",
          parentId: null,
        });

        if (!folder) {
          console.log(`❌ Folder ${folderName} not found`);
          return false;
        }

        // Check if file already exists in file manager
        const existingNode = await FileNode.findOne({
          name: newFileName,
          parentId: folder._id,
        });

        if (existingNode) {
          console.log(`⏭️  File already exists in file manager: ${newFileName}`);
          return true;
        }

        // Check if physical file exists
        const uploadsDir = path.join(__dirname, "../../uploads");
        let physicalFilePath;
        
        // Handle different path formats
        if (filePath.startsWith("/uploads/")) {
          physicalFilePath = path.join(uploadsDir, path.basename(filePath));
        } else if (filePath.startsWith("uploads/")) {
          physicalFilePath = path.join(__dirname, "../../", filePath);
        } else {
          physicalFilePath = path.join(uploadsDir, path.basename(filePath));
        }

        if (!fs.existsSync(physicalFilePath)) {
          console.log(`❌ Physical file not found: ${physicalFilePath}`);
          return false;
        }

        // Get file stats
        const stats = fs.statSync(physicalFilePath);
        const ext = path.extname(physicalFilePath);
        let mimeType = "application/octet-stream";
        
        if (ext.match(/\.(jpg|jpeg|png|gif)$/i)) {
          mimeType = `image/${ext.substring(1).toLowerCase()}`;
        } else if (ext.match(/\.pdf$/i)) {
          mimeType = "application/pdf";
        }

        // Create file node in file manager
        await FileNode.create({
          name: newFileName,
          type: "file",
          parentId: folder._id,
          url: `/uploads/${newFileName}`,
          size: stats.size,
          mimeType: mimeType,
        });

        // Copy/rename physical file if needed
        const newPhysicalPath = path.join(uploadsDir, newFileName);
        if (physicalFilePath !== newPhysicalPath && !fs.existsSync(newPhysicalPath)) {
          fs.copyFileSync(physicalFilePath, newPhysicalPath);
          console.log(`📁 Copied file: ${path.basename(physicalFilePath)} → ${newFileName}`);
        }

        console.log(`✅ Added to file manager: ${newFileName} in ${folderName}`);
        return true;
      } catch (error) {
        console.error(`❌ Error adding file ${newFileName}:`, error.message);
        return false;
      }
    };

    // Sync visitor photos and documents
    console.log("\n📸 Syncing visitor photos and documents...");
    const visitors = await Visitor.find({});
    let visitorCount = 0;

    for (const visitor of visitors) {
      let synced = false;

      // Sync visitor photo
      if (visitor.photo) {
        const ext = path.extname(visitor.photo) || ".jpg";
        const photoName = `${visitor.visitorId}${ext}`;
        const success = await addFileToManager(visitor.photo, photoName, "photo");
        if (success) synced = true;
      }

      // Sync visitor documents
      if (visitor.documents) {
        const docs = visitor.documents;
        
        // Aadhar Front
        if (docs.aadharFront) {
          const ext = path.extname(docs.aadharFront) || ".jpg";
          const fileName = `aadhrFR_${visitor.visitorId}${ext}`;
          const success = await addFileToManager(docs.aadharFront, fileName, "idproof");
          if (success) synced = true;
        }

        // Aadhar Back
        if (docs.aadharBack) {
          const ext = path.extname(docs.aadharBack) || ".jpg";
          const fileName = `aadhrBK_${visitor.visitorId}${ext}`;
          const success = await addFileToManager(docs.aadharBack, fileName, "idproof");
          if (success) synced = true;
        }

        // PAN Front
        if (docs.panFront) {
          const ext = path.extname(docs.panFront) || ".jpg";
          const fileName = `PAN_${visitor.visitorId}${ext}`;
          const success = await addFileToManager(docs.panFront, fileName, "idproof");
          if (success) synced = true;
        }

        // PAN Back
        if (docs.panBack) {
          const ext = path.extname(docs.panBack) || ".jpg";
          const fileName = `PANBACK_${visitor.visitorId}${ext}`;
          const success = await addFileToManager(docs.panBack, fileName, "idproof");
          if (success) synced = true;
        }
      }

      if (synced) visitorCount++;
    }

    // Sync company GST certificates
    console.log("\n📄 Syncing company GST certificates...");
    const companies = await Company.find({});
    let companyCount = 0;

    for (const company of companies) {
      if (company.gst_certificate) {
        const ext = path.extname(company.gst_certificate) || ".pdf";
        const fileName = `GST_${company.companyId}${ext}`;
        const success = await addFileToManager(company.gst_certificate, fileName, "gst_certificate");
        if (success) companyCount++;
      }
    }

    console.log("\n✅ Sync completed!");
    console.log(`📊 Summary:`);
    console.log(`   - Visitors processed: ${visitors.length}`);
    console.log(`   - Visitors with files synced: ${visitorCount}`);
    console.log(`   - Companies processed: ${companies.length}`);
    console.log(`   - Companies with GST certificates synced: ${companyCount}`);

    return {
      success: true,
      visitorsProcessed: visitors.length,
      visitorsWithFilesSynced: visitorCount,
      companiesProcessed: companies.length,
      companiesWithGSTSynced: companyCount,
    };

  } catch (error) {
    console.error("❌ Sync failed:", error);
    throw error;
  }
};

module.exports = { syncExistingFilesToFileManager };