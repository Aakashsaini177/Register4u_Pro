// Fix all file URLs in file manager to use Cloudinary URLs
const mongoose = require('mongoose');
require('dotenv').config();

async function fixAllFileURLs() {
  try {
    console.log('🔧 Fixing all file URLs in file manager to use Cloudinary...');
    
    // Connect to MongoDB with correct database name
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "r4u"
    });
    console.log('✅ Connected to MongoDB');
    
    // Import models
    const { FileNode, Visitor, Company } = require('./src/models');
    
    // Get all files with local paths
    const localPathFiles = await FileNode.find({
      type: 'file',
      url: { $regex: '^/uploads/' }
    });
    
    console.log(`📄 Found ${localPathFiles.length} files with local paths`);
    
    let fixedCount = 0;
    let notFoundCount = 0;
    
    for (const file of localPathFiles) {
      console.log(`\n📄 Processing: ${file.name}`);
      console.log(`   Current URL: ${file.url}`);
      
      // Get parent folder info
      const parentFolder = await FileNode.findById(file.parentId);
      const folderName = parentFolder ? parentFolder.name : 'unknown';
      console.log(`   Folder: ${folderName}`);
      
      let cloudinaryURL = null;
      
      if (folderName === 'photo') {
        // Extract visitor ID from filename (remove extension)
        const visitorId = file.name.replace(/\.(jpg|jpeg|png|gif)$/i, '');
        console.log(`   Looking for visitor: ${visitorId}`);
        
        // Find visitor with this ID
        const visitor = await Visitor.findOne({ visitorId: visitorId });
        
        if (visitor && visitor.photo && visitor.photo.includes('cloudinary')) {
          cloudinaryURL = visitor.photo;
          console.log(`   ✅ Found Cloudinary URL in visitor record`);
        } else {
          console.log(`   ❌ Visitor not found or no Cloudinary photo`);
        }
        
      } else if (folderName === 'idproof') {
        // Extract visitor ID from document filename
        let visitorId = null;
        
        if (file.name.includes('aadhrFR_')) {
          visitorId = file.name.replace('aadhrFR_', '').replace(/\.(jpg|jpeg|png|pdf)$/i, '');
        } else if (file.name.includes('aadhrBK_')) {
          visitorId = file.name.replace('aadhrBK_', '').replace(/\.(jpg|jpeg|png|pdf)$/i, '');
        } else if (file.name.includes('PAN_')) {
          visitorId = file.name.replace('PAN_', '').replace(/\.(jpg|jpeg|png|pdf)$/i, '');
        } else if (file.name.includes('PANBACK_')) {
          visitorId = file.name.replace('PANBACK_', '').replace(/\.(jpg|jpeg|png|pdf)$/i, '');
        }
        
        if (visitorId) {
          console.log(`   Looking for visitor: ${visitorId}`);
          
          const visitor = await Visitor.findOne({ visitorId: visitorId });
          
          if (visitor && visitor.documents) {
            // Check which document type this is
            if (file.name.includes('aadhrFR_') && visitor.documents.aadharFront) {
              cloudinaryURL = visitor.documents.aadharFront;
            } else if (file.name.includes('aadhrBK_') && visitor.documents.aadharBack) {
              cloudinaryURL = visitor.documents.aadharBack;
            } else if (file.name.includes('PAN_') && visitor.documents.panFront) {
              cloudinaryURL = visitor.documents.panFront;
            } else if (file.name.includes('PANBACK_') && visitor.documents.panBack) {
              cloudinaryURL = visitor.documents.panBack;
            }
            
            if (cloudinaryURL && cloudinaryURL.includes('cloudinary')) {
              console.log(`   ✅ Found Cloudinary URL in visitor documents`);
            }
          }
        }
        
      } else if (folderName === 'gst_certificate') {
        // Extract company ID from GST filename
        const match = file.name.match(/GST_(.+?)\.(jpg|jpeg|png|pdf)$/i);
        if (match) {
          const companyId = match[1];
          console.log(`   Looking for company: ${companyId}`);
          
          const company = await Company.findOne({ companyId: companyId });
          
          if (company && company.gst_certificate && company.gst_certificate.includes('cloudinary')) {
            cloudinaryURL = company.gst_certificate;
            console.log(`   ✅ Found Cloudinary URL in company record`);
          } else {
            console.log(`   ❌ Company not found or no Cloudinary GST certificate`);
          }
        }
      }
      
      // Update file manager entry if Cloudinary URL found
      if (cloudinaryURL) {
        await FileNode.findByIdAndUpdate(file._id, {
          url: cloudinaryURL
        });
        
        console.log(`   🔧 Updated to: ${cloudinaryURL}`);
        fixedCount++;
      } else {
        console.log(`   ⚠️  No Cloudinary URL found - keeping local path`);
        notFoundCount++;
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Fixed: ${fixedCount} files`);
    console.log(`   ⚠️  Not found: ${notFoundCount} files`);
    console.log(`   📄 Total processed: ${localPathFiles.length} files`);
    
    if (fixedCount > 0) {
      console.log(`\n🎉 SUCCESS! ${fixedCount} files now use Cloudinary URLs`);
      console.log(`   All images should now display correctly in file manager`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

fixAllFileURLs();