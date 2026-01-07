const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./src/config/database');
const { FileNode } = require('./src/models');

connectDB().then(async () => {
  console.log('✅ Connected to MongoDB');
  
  try {
    // Find photo folder
    const photoFolder = await FileNode.findOne({
      name: "photo",
      type: "folder",
      parentId: null,
    });

    if (photoFolder) {
      console.log('📁 Photo folder found:', photoFolder._id);
      
      // Get all files in photo folder
      const photoFiles = await FileNode.find({
        parentId: photoFolder._id,
        type: "file"
      });

      console.log(`📄 Files in photo folder: ${photoFiles.length}`);
      
      photoFiles.forEach(file => {
        console.log(`\n📸 File: ${file.name}`);
        console.log(`   - URL: ${file.url}`);
        console.log(`   - MIME Type: ${file.mimeType}`);
        console.log(`   - Size: ${file.size}`);
        console.log(`   - Created: ${file.createdAt}`);
      });

      // Check idproof folder for comparison
      const idproofFolder = await FileNode.findOne({
        name: "idproof",
        type: "folder",
        parentId: null,
      });

      if (idproofFolder) {
        console.log('\n📁 ID Proof folder found:', idproofFolder._id);
        
        const idproofFiles = await FileNode.find({
          parentId: idproofFolder._id,
          type: "file"
        }).limit(3); // Just first 3 for comparison

        console.log(`📄 Sample files in idproof folder:`);
        
        idproofFiles.forEach(file => {
          console.log(`\n🆔 File: ${file.name}`);
          console.log(`   - URL: ${file.url}`);
          console.log(`   - MIME Type: ${file.mimeType}`);
          console.log(`   - Size: ${file.size}`);
        });
      }

    } else {
      console.log('❌ Photo folder not found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}).catch(err => {
  console.error('❌ Database connection error:', err);
  process.exit(1);
});