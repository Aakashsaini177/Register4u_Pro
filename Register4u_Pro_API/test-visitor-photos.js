// Test script to check visitor photos and file manager
const mongoose = require('mongoose');
require('dotenv').config();

async function testVisitorPhotos() {
  try {
    console.log('🧪 Testing visitor photos and file manager...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Import models
    const { Visitor, FileNode } = require('./src/models');
    
    // Get visitors with photos
    const visitorsWithPhotos = await Visitor.find({
      photo: { $exists: true, $ne: null, $ne: "" }
    }).select('name visitorId photo').limit(10);
    
    console.log(`👥 Found ${visitorsWithPhotos.length} visitors with photos`);
    
    visitorsWithPhotos.forEach(visitor => {
      console.log(`👤 ${visitor.name} (${visitor.visitorId}): ${visitor.photo}`);
      
      if (visitor.photo.includes('cloudinary')) {
        console.log(`  ✅ Cloudinary URL`);
      } else if (visitor.photo.startsWith('/uploads/')) {
        console.log(`  ⚠️  Local path`);
      } else {
        console.log(`  ❓ Other format`);
      }
    });
    
    // Check file manager folders
    const folders = await FileNode.find({
      type: 'folder',
      parentId: null
    });
    
    console.log(`\n📁 Found ${folders.length} root folders:`);
    folders.forEach(folder => {
      console.log(`  📁 ${folder.name}`);
    });
    
    // Check photo folder
    const photoFolder = folders.find(f => f.name === 'photo');
    if (photoFolder) {
      const photoFiles = await FileNode.find({
        parentId: photoFolder._id,
        type: 'file'
      });
      console.log(`\n📸 Photo folder contains ${photoFiles.length} files`);
      
      photoFiles.slice(0, 5).forEach(file => {
        console.log(`  📄 ${file.name}: ${file.url}`);
      });
    }
    
    // Check idproof folder
    const idproofFolder = folders.find(f => f.name === 'idproof');
    if (idproofFolder) {
      const idproofFiles = await FileNode.find({
        parentId: idproofFolder._id,
        type: 'file'
      });
      console.log(`\n🆔 ID proof folder contains ${idproofFiles.length} files`);
      
      idproofFiles.slice(0, 5).forEach(file => {
        console.log(`  📄 ${file.name}: ${file.url}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testVisitorPhotos();