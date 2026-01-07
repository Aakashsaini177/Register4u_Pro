// Test script to check file manager photo URLs
const mongoose = require('mongoose');
require('dotenv').config();

async function testFileManager() {
  try {
    console.log('🧪 Testing file manager photo URLs...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Import FileNode model
    const { FileNode } = require('./src/models');
    
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
    }).limit(10);
    
    console.log(`📸 Photo folder contains ${photoFiles.length} files`);
    
    // Check URL patterns
    let cloudinaryCount = 0;
    let localPathCount = 0;
    let otherCount = 0;
    
    photoFiles.forEach(file => {
      console.log(`📄 ${file.name}: ${file.url}`);
      
      if (file.url.includes('cloudinary')) {
        cloudinaryCount++;
        console.log(`  ✅ Cloudinary URL`);
      } else if (file.url.startsWith('/uploads/')) {
        localPathCount++;
        console.log(`  ⚠️  Local path (problematic)`);
      } else {
        otherCount++;
        console.log(`  ❓ Other format`);
      }
    });
    
    console.log('\n📊 Summary:');
    console.log(`  Cloudinary URLs: ${cloudinaryCount}`);
    console.log(`  Local paths: ${localPathCount}`);
    console.log(`  Other formats: ${otherCount}`);
    
    if (localPathCount > 0) {
      console.log('\n⚠️  Found local paths in file manager - these will cause "Route not found" errors');
      console.log('   Individual uploads are storing local paths instead of Cloudinary URLs');
    }
    
    if (cloudinaryCount > 0) {
      console.log('\n✅ Found Cloudinary URLs - these should work correctly');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testFileManager();