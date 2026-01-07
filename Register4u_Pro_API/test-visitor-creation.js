// Test visitor creation to see the exact flow
const mongoose = require('mongoose');
require('dotenv').config();

async function testVisitorCreation() {
  try {
    console.log('🧪 Testing visitor creation flow...');
    
    // Connect to MongoDB with correct database name
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "r4u"
    });
    console.log('✅ Connected to MongoDB');
    
    // Import models
    const { FileNode, Visitor } = require('./src/models');
    
    // Find the latest visitor
    const latestVisitor = await Visitor.findOne().sort({ createdAt: -1 });
    
    if (latestVisitor) {
      console.log('👤 Latest visitor:');
      console.log(`   ID: ${latestVisitor.visitorId}`);
      console.log(`   Name: ${latestVisitor.name}`);
      console.log(`   Photo: ${latestVisitor.photo}`);
      console.log(`   Created: ${latestVisitor.createdAt}`);
      
      // Check if photo is Cloudinary URL
      if (latestVisitor.photo) {
        if (latestVisitor.photo.includes('cloudinary')) {
          console.log('   ✅ Photo: Cloudinary URL (correct)');
        } else {
          console.log('   ⚠️  Photo: Local path (incorrect)');
        }
      }
      
      // Check file manager entry for this visitor
      const photoFolder = await FileNode.findOne({
        name: 'photo',
        type: 'folder',
        parentId: null
      });
      
      if (photoFolder) {
        const photoFile = await FileNode.findOne({
          name: { $regex: new RegExp(latestVisitor.visitorId, 'i') },
          parentId: photoFolder._id
        });
        
        if (photoFile) {
          console.log('\n📄 File manager entry:');
          console.log(`   Name: ${photoFile.name}`);
          console.log(`   URL: ${photoFile.url}`);
          
          if (photoFile.url.includes('cloudinary')) {
            console.log('   ✅ File manager: Cloudinary URL (correct)');
          } else {
            console.log('   ⚠️  File manager: Local path (incorrect)');
          }
        } else {
          console.log('\n❌ No file manager entry found for this visitor');
        }
      }
    } else {
      console.log('❌ No visitors found');
    }
    
    // Check all recent file manager entries
    console.log('\n📁 Recent file manager entries:');
    const recentFiles = await FileNode.find({ type: 'file' }).sort({ createdAt: -1 }).limit(5);
    
    recentFiles.forEach(file => {
      console.log(`   📄 ${file.name}: ${file.url}`);
      if (file.url.includes('cloudinary')) {
        console.log('     ✅ Cloudinary URL');
      } else if (file.url.startsWith('/uploads/')) {
        console.log('     ⚠️  Local path');
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testVisitorCreation();