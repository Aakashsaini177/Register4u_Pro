const { Visitor, Company, FileNode } = require("../models");

/**
 * Utility to sync existing Cloudinary files to file manager
 * This handles files that are stored on Cloudinary but need to appear in file manager
 */
const syncCloudinaryToFileManager = async () => {
  console.log("🔄 Starting sync of Cloudinary files to file manager...");

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

    // Helper function to add Cloudinary file to file manager
    const addCloudinaryFileToManager = async (cloudinaryUrl, fileName, folderName, mimeType = "image/jpeg", size = 0) => {
      try {
        if (!cloudinaryUrl || !fileName) return false;

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
          name: fileName,
          parentId: folder._id,
        });

        if (existingNode) {
          console.log(`⏭️  File already exists in file manager: ${fileName}`);
          return true;
        }

        // Create file node in file manager with Cloudinary URL
        await FileNode.create({
          name: fileName,
          type: "file",
          parentId: folder._id,
          url: cloudinaryUrl, // Use Cloudinary URL directly
          size: size,
          mimeType: mimeType,
        });

        console.log(`✅ Added to file manager: ${fileName} → ${cloudinaryUrl}`);
        return true;
      } catch (error) {
        console.error(`❌ Error adding file ${fileName}:`, error.message);
        return false;
      }
    };

    // Sync visitor photos and documents
    console.log("\n📸 Syncing visitor photos and documents from Cloudinary...");
    const visitors = await Visitor.find({});
    let visitorCount = 0;

    for (const visitor of visitors) {
      let synced = false;

      // Sync visitor photo
      if (visitor.photo && (visitor.photo.includes('cloudinary') || visitor.photo.startsWith('http'))) {
        const ext = visitor.photo.includes('.jpg') ? '.jpg' : 
                   visitor.photo.includes('.png') ? '.png' : 
                   visitor.photo.includes('.jpeg') ? '.jpeg' : '.jpg';
        const photoName = `${visitor.visitorId}${ext}`;
        const success = await addCloudinaryFileToManager(visitor.photo, photoName, "photo", "image/jpeg");
        if (success) synced = true;
      }

      // Sync visitor documents
      if (visitor.documents) {
        const docs = visitor.documents;
        
        // Aadhar Front
        if (docs.aadharFront && (docs.aadharFront.includes('cloudinary') || docs.aadharFront.startsWith('http'))) {
          const ext = docs.aadharFront.includes('.jpg') ? '.jpg' : 
                     docs.aadharFront.includes('.png') ? '.png' : 
                     docs.aadharFront.includes('.jpeg') ? '.jpeg' : '.jpg';
          const fileName = `aadhrFR_${visitor.visitorId}${ext}`;
          const success = await addCloudinaryFileToManager(docs.aadharFront, fileName, "idproof", "image/jpeg");
          if (success) synced = true;
        }

        // Aadhar Back
        if (docs.aadharBack && (docs.aadharBack.includes('cloudinary') || docs.aadharBack.startsWith('http'))) {
          const ext = docs.aadharBack.includes('.jpg') ? '.jpg' : 
                     docs.aadharBack.includes('.png') ? '.png' : 
                     docs.aadharBack.includes('.jpeg') ? '.jpeg' : '.jpg';
          const fileName = `aadhrBK_${visitor.visitorId}${ext}`;
          const success = await addCloudinaryFileToManager(docs.aadharBack, fileName, "idproof", "image/jpeg");
          if (success) synced = true;
        }

        // PAN Front
        if (docs.panFront && (docs.panFront.includes('cloudinary') || docs.panFront.startsWith('http'))) {
          const ext = docs.panFront.includes('.jpg') ? '.jpg' : 
                     docs.panFront.includes('.png') ? '.png' : 
                     docs.panFront.includes('.jpeg') ? '.jpeg' : '.jpg';
          const fileName = `PAN_${visitor.visitorId}${ext}`;
          const success = await addCloudinaryFileToManager(docs.panFront, fileName, "idproof", "image/jpeg");
          if (success) synced = true;
        }

        // PAN Back
        if (docs.panBack && (docs.panBack.includes('cloudinary') || docs.panBack.startsWith('http'))) {
          const ext = docs.panBack.includes('.jpg') ? '.jpg' : 
                     docs.panBack.includes('.png') ? '.png' : 
                     docs.panBack.includes('.jpeg') ? '.jpeg' : '.jpg';
          const fileName = `PANBACK_${visitor.visitorId}${ext}`;
          const success = await addCloudinaryFileToManager(docs.panBack, fileName, "idproof", "image/jpeg");
          if (success) synced = true;
        }
      }

      if (synced) visitorCount++;
    }

    // Sync company GST certificates
    console.log("\n📄 Syncing company GST certificates from Cloudinary...");
    const companies = await Company.find({});
    let companyCount = 0;

    for (const company of companies) {
      if (company.gst_certificate && (company.gst_certificate.includes('cloudinary') || company.gst_certificate.startsWith('http'))) {
        const ext = company.gst_certificate.includes('.pdf') ? '.pdf' : 
                   company.gst_certificate.includes('.jpg') ? '.jpg' : 
                   company.gst_certificate.includes('.png') ? '.png' : '.pdf';
        const fileName = `GST_${company.companyId}${ext}`;
        const mimeType = ext === '.pdf' ? 'application/pdf' : 'image/jpeg';
        const success = await addCloudinaryFileToManager(company.gst_certificate, fileName, "gst_certificate", mimeType);
        if (success) companyCount++;
      }
    }

    console.log("\n✅ Cloudinary sync completed!");
    console.log(`📊 Summary:`);
    console.log(`   - Visitors processed: ${visitors.length}`);
    console.log(`   - Visitors with Cloudinary files synced: ${visitorCount}`);
    console.log(`   - Companies processed: ${companies.length}`);
    console.log(`   - Companies with Cloudinary GST certificates synced: ${companyCount}`);

    return {
      success: true,
      visitorsProcessed: visitors.length,
      visitorsWithCloudinaryFilesSynced: visitorCount,
      companiesProcessed: companies.length,
      companiesWithCloudinaryGSTSynced: companyCount,
    };

  } catch (error) {
    console.error("❌ Cloudinary sync failed:", error);
    throw error;
  }
};

module.exports = { syncCloudinaryToFileManager };