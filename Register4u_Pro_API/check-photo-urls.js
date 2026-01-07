// Check and fix photo URLs in file manager
const mongoose = require('mongoose');
require('dotenv').config();

async function checkAndFixPhotoURLs() {
  try {
    console.log('🔍 Checking photo URLs in file manager...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Import models
    const { FileNode, Visitor } = require('./src/models');
    
    // Find photo folder
    const photoFolder = await FileNode.findOne({
      name: 'photo',
      type: 'folder',
      parentId: null
    });
    
    if (!photoFolder) {
      console.log('❌ Photo folder not found');
      return;
    }
    
    console.log(`📁 Found photo folder: ${photoFolder._id}`);
    
    // Get all files in photo folder
    const photoFiles = await FileNode.find({
      parentId: photoFolder._id,
      type: 'file'
    });
    
    console.log(`📸 Photo folder contains ${photoFiles.length} files`);
    
    for (const file of photoFiles) {
      console.log(`\n📄 Checking file: ${file.name}`);
      console.log(`   Current URL: ${file.url}`);
      
      if (file.url.startsWith('/uploads/')) {
        console.log('⚠️  Found local path - need to fix this!');
        
        // Extract visitor ID from filename (remove extension)
        const visitorId = file.name.replace(/\.(jpg|jpeg|png|gif)$/i, '');
        console.log(`   Extracted visitor ID: ${visitorId}`);
        
        // Find visitor with this ID
        const visitor = await Visitor.findOne({ visitorId: visitorId });
        
        if (visitor && visitor.photo) {
          console.log(`   Found visitor: ${visitor.name}`);
          console.log(`   Visitor photo URL: ${visitor.photo}`);
          
          if (visitor.photo.includes('cloudinary')) {
            console.log('✅ Visitor has Cloudinary URL - updating file manager...');
            
            // Update file manager entry with Cloudinary URL
            await FileNode.findByIdAndUpdate(file._id, {
              url: visitor.photo
            });
            
            console.log('✅ Updated file manager with Cloudinary URL');
          } else {
            console.log('⚠️  Visitor also has local path');
          }
        } else {
          console.log('❌ Visitor not found or has no photo');
        }
      } else if (file.url.includes('cloudinary')) {
        console.log('✅ Already has Cloudinary URL');
      } else {
        console.log('❓ Unknown URL format');
      }
    }
    
    // Check idproof folder for comparison
    const idproofFolder = await FileNode.findOne({
      name: 'idproof',
      type: 'folder',
      parentId: null
    });
    
    if (idproofFolder) {
      const idproofFiles = await FileNode.find({
        parentId: idproofFolder._id,
        type: 'file'
      }).limit(3);
      
      console.log(`\n🆔 ID proof folder sample (${idproofFiles.length} files):`);
      idproofFiles.forEach(file => {
        console.log(`   📄 ${file.name}: ${file.url}`);
        if (file.url.includes('cloudinary')) {
          console.log('     ✅ Cloudinary URL (working correctly)');
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkAndFixPhotoURLs();